import Source from './source';
import CameraSource from './camera-source';
import ImageSource from './image-source';
import BlankSource from './blank-source';
import Maybe from './maybe';

export default class SourceController {
    public static readonly BLANK: BlankSource = new BlankSource();

    // Camera
    private camera: Maybe<CameraSource> = Maybe.none<CameraSource>();
    private cameraLoaded: boolean = false;
    private lastCameraFrame: Maybe<ImageSource> = Maybe.none<ImageSource>();

    // Local image
    private currentLocalImage: Maybe<ImageSource> = Maybe.none<ImageSource>();

    public getNoop() {
        return SourceController.BLANK;
    }

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

    private destroyCamera() {
        this.camera.map(camera => {
            camera.destroy();
        })
    }

    public async reloadCamera() {
        this.destroyCamera();
        await this.initCamera();
    }

    public async getCamera() {
        if(!this.cameraLoaded)
            await this.initCamera();

        return this.camera.map(
            camera => {
                camera.play();
                return camera;
            }
        ).getOrElse(SourceController.BLANK);
    }

    public async captureCameraFrame() {
        const cameraFrame =
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

                return image;
            });

        return cameraFrame.getOrElse(SourceController.BLANK);
    }

    public async loadLocalImage(image: ImageSource) {
        await image.waitUntilLoaded();
        this.currentLocalImage = Maybe.some(image);

        return image;
    }

    public async pauseCamera() {
        this.camera.map(
            camera => camera.pause()
        );
    }

    private static async clearImage(maybeImage: Maybe<ImageSource>) {
        maybeImage.map(image => image.destroy());
        return Maybe.none<ImageSource>();
    }

    public async clearLastCameraFrame() {
        this.lastCameraFrame =
            await SourceController.clearImage(this.lastCameraFrame);
    }

    public async clearCurrentLocalImage() {
        this.currentLocalImage =
            await SourceController.clearImage(this.currentLocalImage);
    }
}
