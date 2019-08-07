import Source from './source';
import CameraSource from './camera-source';
import ImageSource from './image-source';
import BlankSource from './blank-source';
import Maybe from './maybe';

export enum SourceType {
    BLANK,
    CAMERA,
    CAMERA_FRAME,
    LOCAL_IMAGE
}

type Blank = BlankSource;
type CameraOrBlank = CameraSource | Blank;
type CameraFrameOrBlank = ImageSource | Blank;
type LocalImageOrBlank = ImageSource | Blank;

type SourceSwitchHandlers = {
    [type in SourceType]: () => Promise<void>
};

type SourceRetriever = {
    [SourceType.BLANK]: () => Blank,
    [SourceType.CAMERA]: () => CameraOrBlank,
    [SourceType.CAMERA_FRAME]: () => CameraFrameOrBlank,
    [SourceType.LOCAL_IMAGE]: () => LocalImageOrBlank
};

export default class SourceController {
    private currentSource: SourceType = SourceType.BLANK;

    // All available sources
    public static readonly BLANK: BlankSource = new BlankSource();
    private camera: Maybe<CameraSource> = Maybe.none<CameraSource>();
    private cameraLoaded: boolean = false;
    private lastCameraFrame: Maybe<ImageSource> = Maybe.none<ImageSource>();
    private currentImage: Maybe<ImageSource> = Maybe.none<ImageSource>();

    private fromHandlers: SourceSwitchHandlers = {
        [SourceType.BLANK]: this.noop,
        [SourceType.CAMERA]: this.pauseCamera,
        [SourceType.CAMERA_FRAME]: this.clearLastCameraFrame,
        [SourceType.LOCAL_IMAGE]: this.clearCurrentImage
    }

    private toHandlers: SourceSwitchHandlers = {
        [SourceType.BLANK]: this.noop,
        [SourceType.CAMERA]: this.playCamera,
        [SourceType.CAMERA_FRAME]: this.captureCameraFrame,
        [SourceType.LOCAL_IMAGE]: this.loadLocalImage
    };

    private sourceRetriever: SourceRetriever = {
        [SourceType.BLANK]: () => SourceController.BLANK,
        [SourceType.CAMERA]: () => this.camera.getOrElse(SourceController.BLANK),
        [SourceType.CAMERA_FRAME]: () => this.lastCameraFrame.getOrElse(SourceController.BLANK),
        [SourceType.LOCAL_IMAGE]: () => this.currentImage.getOrElse(SourceController.BLANK)
    };

    public async switchTo(sourceType: SourceType) {
        const previousSource = this.currentSource;
        const switchFromPrevious = this.fromHandlers[previousSource].bind(this);
        await switchFromPrevious();

        this.currentSource = sourceType;
        const switchToNext = this.toHandlers[this.currentSource].bind(this);
        await switchToNext();

        return this.getCurrent();
    }

    public getCurrent() {
        const retrieveSource =
            this.sourceRetriever[this.currentSource];

        return retrieveSource();
    }

    private async noop() {}

    private async initCamera() {
        const camera = new CameraSource();

        try {
            await camera.load();

            this.camera = Maybe.some(camera);
            this.cameraLoaded = true;
        } catch(err) {
            this.camera = Maybe.none<CameraSource>();
            throw err;
        }
    }

    private async playCamera() {
        if(!this.cameraLoaded)
            await this.initCamera();

        this.camera.map(
            camera => camera.play()
        );
    }

    private async captureCameraFrame() {
        await this.camera.mapAsync(async (camera) => {
            const tempCanvas = document.createElement('canvas');

            const {
                width: cameraWidth,
                height: cameraHeight
            } = camera.getDimensions();

            tempCanvas.width = cameraWidth;
            tempCanvas.height = cameraHeight;

            const tempCanvasContext = tempCanvas.getContext('2d');
            if(!tempCanvasContext)
                return;

            const cameraData = camera.getRawSource();
            tempCanvasContext.drawImage(cameraData, 0, 0);

            const imageDataURL = tempCanvas.toDataURL('image/jpeg', 1);
            const image = new ImageSource(imageDataURL);
            await image.waitUntilLoaded();

            this.lastCameraFrame = Maybe.some(image);

            tempCanvas.remove();
        });
    }

    private async loadLocalImage() {
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.click();

        try {
            const newImage = await new Promise<ImageSource>(
                (resolve, reject) => {
                    fileInput.onchange = () => {
                        const choice =
                            fileInput.files && fileInput.files[0];

                        if(!choice)
                            return reject(new Error('No file selected.'));

                        const imageUrl = URL.createObjectURL(choice);
                        const image = new ImageSource(imageUrl);
                        return resolve(image);
                    };
                }
            );

            await newImage.waitUntilLoaded();
            this.currentImage = Maybe.some(newImage);
        } catch(err) {
            console.error(err);
        } finally {
            fileInput.remove();
        }
    }

    private async pauseCamera() {
        this.camera.map(
            camera => camera.pause()
        );
    }

    private async clearImage(maybeImage: Maybe<ImageSource>) {
        maybeImage.map(image => image.destroy());
        return Maybe.none<ImageSource>();
    }

    private async clearLastCameraFrame() {
        this.lastCameraFrame =
            await this.clearImage(this.lastCameraFrame);
    }

    private async clearCurrentImage() {
        this.currentImage =
            await this.clearImage(this.currentImage);
    }
}
