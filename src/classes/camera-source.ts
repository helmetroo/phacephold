import Dimensions from './dimensions';
import Source from './source';

export default class CameraSource extends Source {
    private static readonly IDENTIFIER = 'video-source';

    private cameraVideo: HTMLVideoElement;
    private cameraStream: MediaStream | null | null = null;
    private cameraVideoDimensions: Dimensions | null = null;

    private loaded: boolean = false;

    constructor() {
        super();

        this.cameraVideo = document.createElement('video');
        this.cameraVideo.id = CameraSource.IDENTIFIER;
        this.cameraVideo.className = CameraSource.IDENTIFIER;
    }

    public async load() {
        // There isn't a trivial way to get the highest resolution for a camera,
        // so we assume 4096x2160 is the highest for commercially available consumer webcams
        try {
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

            this.cameraStream = stream;
            this.cameraVideo.srcObject = stream;
            await CameraSource.waitUntilLoaded(this.cameraVideo);

            this.cameraVideoDimensions = CameraSource.computeDimensions(this.cameraStream);

            this.loaded = true;
        } catch(err) {
            const cameraAlreadyInUse =
                (err.name === 'NotReadableError') || (err.name === 'TrackStartError');
            if(cameraAlreadyInUse) {
                const alreadyInUseErr = new Error(`Camera is unavailable for use. It's most likely being used by another app. To use it here, disable it in any apps that are using it and try reloading.`);
                throw alreadyInUseErr;
            }

            const cameraRejected =
                (err.name === 'NotAllowedError');
            if(cameraRejected) {
                const rejectedErr = new Error(`Camera is unavailable for use. If you didn't intend this, try reloading and allow the camera, or go into your page settings to allow the camera for this page.`);
                throw rejectedErr;
            }

            const unknownErr = new Error(`Camera is unavailable. ${err.message}`);
            throw unknownErr;
        }
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

    private static computeDimensions(cameraStream: MediaStream) {
        const cameraVideoTrack = CameraSource.getVideoTrack(cameraStream);
        const cameraVideoTrackSettings = cameraVideoTrack.getSettings();

        const dimensions: Dimensions = {
            width: cameraVideoTrackSettings.width!,
            height: cameraVideoTrackSettings.height!
        }

        return dimensions;
    }

    private static getVideoTrack(cameraStream: MediaStream) {
        return cameraStream.getVideoTracks()[0];
    }

    public getRawSource() {
        return this.cameraVideo;
    }

    public getDimensions() {
        return this.cameraVideoDimensions!;
    }

    public destroy() {
        if(this.cameraStream) {
            const cameraVideoTrack = CameraSource.getVideoTrack(this.cameraStream);
            cameraVideoTrack.stop();
        }

        this.cameraVideo.remove();
    }
}
