import FaceDetector, { FaceLandmarksResult } from './face-detector';
import Point from './point';

// UI
import FPSCounter from './fps-counter';

class App {
    private static readonly VIDEO_ID = '#video';
    private static readonly DATA_CANVAS_ID = '#video-data';
    private static readonly OVERLAY_CANVAS_ID = '#video-overlay';

    private faceDetector: FaceDetector = new FaceDetector();

    private video: HTMLVideoElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;

    private fpsCounter: FPSCounter = new FPSCounter();

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
            //this.faceDetector.drawDebugOverlay(this.video!, this.overlayCanvas!, faceLandmarkResult);

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

        this.fpsCounter.update();

        this.beginDetectFaces();
    }

    private makeEyeFlap(leftEye: Point[], rightEye: Point[], jawOutline: Point[]) {
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

        ctx.translate(eyeCenter.x, eyeCenter.y);
        ctx.scale(1.5, 1.5);
        ctx.translate(-eyeCenter.x, -eyeCenter.y);
        // TODO translate to get closer towards mouth

        const eyeHeightFactor = 4; // Tweakable.
        const eyeMinYDiff = rightEyeMin.y - leftEyeMin.y;
        const eyeMaxYDiff = rightEyeMax.y - leftEyeMax.y;
        const leftEyeMinX = jawMin.x;
        const leftEyeMinY = leftEyeMin.y - (eyeMinYDiff * eyeHeightFactor);
        const leftEyeMaxY = leftEyeMax.y + (eyeMaxYDiff * eyeHeightFactor);
        const rightEyeMaxX = jawMax.x;
        const rightEyeMinY = rightEyeMin.y - (eyeMinYDiff * eyeHeightFactor);
        const rightEyeMaxY = rightEyeMax.y + (eyeMaxYDiff * eyeHeightFactor);

        ctx.moveTo(leftEyeMinX, leftEyeMinY);
        ctx.lineTo(rightEyeMaxX, rightEyeMinY);
        ctx.lineTo(rightEyeMaxX, rightEyeMaxY);
        ctx.lineTo(leftEyeMinX, leftEyeMaxY);
        ctx.lineTo(leftEyeMinX, leftEyeMinY);

        ctx.fill();
        ctx.clip();
        ctx.drawImage(this.video!, 0, 0);

        ctx.restore();
    }

    private makeMouthFlap(mouth: Point[], jawOutline: Point[]) {
        const [mouthMin, mouthMax] = Point.getMinMaxForPoints(mouth);
        const [jawMin, jawMax] = Point.getMinMaxForPoints(jawOutline);
        const mouthCenter = Point.getCenter([mouthMin, mouthMax, jawMin, jawMax]);

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();

        ctx.translate(mouthCenter.x, mouthCenter.y);
        ctx.scale(1.5, 1.5);
        ctx.translate(-mouthCenter.x, -mouthCenter.y);
        // TODO translate to get closer towards eyes

        ctx.rect(
            jawMin.x, mouthMin.y,
            jawMax.x - jawMin.x, mouthMax.y - mouthMin.y
        );
        ctx.fill();
        ctx.clip();
        ctx.drawImage(this.video!, 0, 0);

        ctx.restore();
    }

    private clear() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.clearRect(0, 0, this.overlayCanvas!.width, this.overlayCanvas!.height);
    }
}

export default App;
