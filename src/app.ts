import FaceDetector, { FaceLandmarksResult } from './face-detector';
import Point from './point';

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

        this.clear();

        if(faceLandmarkResult) {
            this.faceDetector.drawDebugOverlay(this.video!, this.overlayCanvas!, faceLandmarkResult);

            const mouth = faceLandmarkResult.landmarks.getMouth()
                .map(Point.fromFaceApiPoint);

            const jawOutline = faceLandmarkResult.landmarks.getJawOutline()
                .map(Point.fromFaceApiPoint);

            const leftEye = faceLandmarkResult.landmarks.getLeftEye()
                .map(Point.fromFaceApiPoint);

            const rightEye = faceLandmarkResult.landmarks.getRightEye()
                .map(Point.fromFaceApiPoint);

            this.makeMouthFlap(mouth, jawOutline);
            this.makeEyeFlap(leftEye, rightEye, jawOutline);
        }

        this.updateFps();

        this.beginDetectFaces();
    }

    private makeEyeFlap(leftEye: Point[], rightEye: Point[], jawOutline: Point[]) {
        //(xmin, ymin), (xmin, ymax), (xmax, ymax), (xmax, ymin)
        const [leftEyeMin, leftEyeMax] = Point.getMinMaxForPoints(leftEye);
        const leftEyeCenter = Point.getCenter(leftEye);

        const [rightEyeMin, rightEyeMax] = Point.getMinMaxForPoints(rightEye);
        const rightEyeCenter = Point.getCenter(rightEye);

        const [jawMin, jawMax] = Point.getMinMaxForPoints(jawOutline);

        const eyeCenter = Point.getCenter([leftEyeCenter, rightEyeCenter]);

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'green';

        // TODO refactor redundanct calculations
        const eyeHeightFactor = 4; // Tweakable.
        const leftEyeMinX = jawMin.x;
        const leftEyeMinY = leftEyeMin.y - (rightEyeMin.y - leftEyeMin.y)*eyeHeightFactor;
        const leftEyeMaxY = leftEyeMax.y + (rightEyeMax.y - leftEyeMax.y)*eyeHeightFactor;
        const rightEyeMaxX = jawMax.x;
        const rightEyeMinY = rightEyeMin.y - (rightEyeMin.y - leftEyeMin.y)*eyeHeightFactor;
        const rightEyeMaxY = rightEyeMax.y + (rightEyeMax.y - leftEyeMax.y)*eyeHeightFactor;

        ctx.moveTo(leftEyeMinX, leftEyeMinY);
        ctx.lineTo(rightEyeMaxX, rightEyeMinY);
        ctx.lineTo(rightEyeMaxX, rightEyeMaxY);
        ctx.lineTo(leftEyeMinX, leftEyeMaxY);
        ctx.lineTo(leftEyeMinX, leftEyeMinY);
        ctx.stroke();
        ctx.restore();
    }

    private makeMouthFlap(mouth: Point[], jawOutline: Point[]) {
        const [mouthMin, mouthMax] = Point.getMinMaxForPoints(mouth);

        // TODO redundant
        const [jawMin, jawMax] = Point.getMinMaxForPoints(jawOutline);

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'yellow';

        const mouthHeightFactor = 4;
        ctx.rect(
            jawMin.x, mouthMin.y,
            jawMax.x - jawMin.x, mouthMax.y - mouthMin.y
        );
        ctx.stroke();
        ctx.restore();
    }

    private clear() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.clearRect(0, 0, this.overlayCanvas!.width, this.overlayCanvas!.height);
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
