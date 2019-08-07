import Dimensions from './dimensions';
import Source from './source';

export default class CameraSource extends Source {
    private static readonly IDENTIFIER = 'video-source';

    private cameraVideo: HTMLVideoElement;
    private cameraVideoDimensions: Dimensions | null = null;

    private loaded: boolean = false;

    constructor() {
        super();

        this.cameraVideo = document.createElement('video');
        this.cameraVideo.id = CameraSource.IDENTIFIER;
        this.cameraVideo.className = CameraSource.IDENTIFIER;
    }

    public async load() {
        // TODO handle errors (i.e. user denies access)
        // There isn't a trivial way to get the highest resolution for a camera,
        // so we assume 4096x2160 is the highest for commercially available consumer webcams
        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {
                        ideal: 4096
                    },

                    height: {
                        ideal: 2160
                    },

                    facingMode: 'user'
                }
            });

        this.cameraVideo.srcObject = stream;
        await CameraSource.waitUntilLoaded(this.cameraVideo);

        this.cameraVideoDimensions = CameraSource.computeDimensions(this.cameraVideo);

        this.loaded = true;
    }

    private static async waitUntilLoaded(cameraVideo: HTMLVideoElement) {
        await new Promise((resolve, reject) => {
            cameraVideo.onloadedmetadata = resolve;
        });
    }

    public play() {
        if(this.loaded)
            this.cameraVideo.play();
    }

    public pause() {
        if(this.loaded)
            this.cameraVideo.pause();
    }

    private static computeDimensions(cameraVideo: HTMLVideoElement) {
        const cameraVideoSrc = <MediaStream> cameraVideo.srcObject;
        const cameraVideoTrackSettings = cameraVideoSrc.getVideoTracks()[0].getSettings();

        const dimensions: Dimensions = {
            width: cameraVideoTrackSettings.width!,
            height: cameraVideoTrackSettings.height!
        }

        return dimensions;
    }

    public getRawSource() {
        return this.cameraVideo;
    }

    public getDimensions() {
        return this.cameraVideoDimensions!;
    }
}
