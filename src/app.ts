import FaceDetector, { FaceLandmarksResult } from './face-detector';

class App {
    private static readonly VIDEO_ID = '#video';
    private static readonly DATA_CANVAS_ID = '#video-data';
    private static readonly OVERLAY_CANVAS_ID = '#video-overlay';

    private faceDetector: FaceDetector = new FaceDetector();

    private video: HTMLVideoElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;

    private lastUpdate: number = 0;

    public async init() {
        await this.initVideo();
        await this.initFaceDetector();
        this.initOverlayCanvas();
        this.beginDetectFaces();
    }

    private async initVideo() {
        const stream = await (navigator as Navigator).mediaDevices
            .getUserMedia({ video: true });

        this.video =
            document.querySelector<HTMLVideoElement>(App.VIDEO_ID)!;
        this.video.srcObject = stream;

        return new Promise((resolve, reject) => {
            this.video!.onloadedmetadata = resolve;
        });
    }

    private async initFaceDetector() {
        return this.faceDetector.init();
    }

    private initOverlayCanvas() {
        this.overlayCanvas = this.initCanvas(App.OVERLAY_CANVAS_ID);
    }

    private initCanvas(id: string) {
        const canvas =
            document.querySelector<HTMLCanvasElement>(id)!;

        canvas.setAttribute('width', String(this.video!.offsetWidth));
        canvas.setAttribute('height', String(this.video!.offsetHeight));

        return canvas;
    }

    private beginDetectFaces() {
        requestAnimationFrame(this.detectFaces.bind(this));
    }

    private async detectFaces() {
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(this.video!);

        if(faceLandmarkResult) {
            this.faceDetector.drawDebugOverlay(this.video!, this.overlayCanvas!, faceLandmarkResult);
            this.drawFaceFold(faceLandmarkResult);
        }

        this.updateFps();

        this.beginDetectFaces();
    }

    private drawFaceFold(faceLandmarks: FaceLandmarksResult) {

    }

    private updateFps() {
        const now = window.performance.now();
        const interval = now - this.lastUpdate;
        this.lastUpdate = now;

        const fps = Math.round(1000 / interval);

        document.querySelector('#fps')!.textContent = `${fps} fps`;
    }
}

export default App;
