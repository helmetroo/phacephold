import FaceDetector, { FaceLandmarksResult } from './face-detector';
import Point, { MinMax } from './point';

// UI
import Loader from './loader';
import FPSCounter from './fps-counter';

class App {
    private static readonly VIDEO_ID = '#video';
    private static readonly OVERLAY_CANVAS_ID = '#video-overlay';

    private faceDetector: FaceDetector = new FaceDetector();

    private video: HTMLVideoElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;

    private loaded: boolean = false;

    private loader: Loader = new Loader();
    private fpsCounter: FPSCounter = new FPSCounter();

    // Possibly tweakable attrs
    private mouthFlapScale: number = 1.5;

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
            // Mouth flap
            const mouth = faceLandmarkResult.landmarks.getMouth()
                .map(Point.fromFaceApiPoint);
            const mouthMinMax = Point.getMinMaxForPoints(mouth);

            const jawOutline = faceLandmarkResult.landmarks.getJawOutline()
                .map(Point.fromFaceApiPoint);
            const jawMinMax = Point.getMinMaxForPoints(jawOutline);

            const leftEye = [
                ...faceLandmarkResult.landmarks.getLeftEye(),
                ...faceLandmarkResult.landmarks.getLeftEyeBrow(),
            ].map(Point.fromFaceApiPoint);
            const leftEyeMinMax = Point.getMinMaxForPoints(leftEye);
            const leftEyeCenter = Point.getCenter(leftEye);

            const rightEye = [
                ...faceLandmarkResult.landmarks.getRightEye(),
                ...faceLandmarkResult.landmarks.getRightEyeBrow(),
            ].map(Point.fromFaceApiPoint);
            const rightEyeMinMax = Point.getMinMaxForPoints(rightEye);
            const rightEyeCenter = Point.getCenter(rightEye);

            const eyeAngle = -Point.angleBetween(leftEyeCenter, rightEyeCenter);
            const eyeCenter = Point.getCenter([leftEyeCenter, rightEyeCenter]);
            const eyeMinMax = Point.getMinMaxForPoints([
                ...leftEyeMinMax,
                ...rightEyeMinMax
            ]);

            const [mouthMin] = mouthMinMax;
            const [, eyeMax] = eyeMinMax;
            const mouthEyeDistance = mouthMin.y - eyeMax.y;

            const ctx = this.overlayCanvas!.getContext('2d');
            ctx!.save();

            this.createJawOutlineMask(jawOutline, leftEyeMinMax, rightEyeMinMax);
            //this.makeEyeFlap(leftEyeMinMax, rightEyeMinMax, jawMinMax, eyeAngle, eyeCenter, mouthEyeDistance);
            this.makeMouthFlap(mouthMinMax, jawMinMax, eyeAngle, mouthEyeDistance);

            ctx!.restore();
            this.faceDetector.drawDebugOverlay(this.overlayCanvas!, faceLandmarkResult);
        }

        this.fpsCounter.update();

        this.hideLoaderIfNotHidden();
        this.beginDetectFaces();
    }

    private hideLoaderIfNotHidden() {
        if(!this.loaded) {
            this.loaded = true;
            this.loader.hide();
        }
    }

    private createJawOutlineMask(
        jawOutline: Point[],
        leftEyeMinMax: MinMax,
        rightEyeMinMax: MinMax
    ) {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        const jawOutlineMask = new Path2D();
        jawOutlineMask.moveTo(jawOutline[0].x, jawOutline[0].y);
        for(let index = 1; index < jawOutline.length; ++index) {
            jawOutlineMask.lineTo(jawOutline[index].x, jawOutline[index].y);
        }

        const [leftEyeMin, leftEyeMax] = leftEyeMinMax;
        const [rightEyeMin, rightEyeMax] = rightEyeMinMax;
        jawOutlineMask.lineTo(jawOutline[jawOutline.length - 1].x, rightEyeMax.y);
        jawOutlineMask.lineTo(jawOutline[jawOutline.length - 1].x, rightEyeMin.y);
        jawOutlineMask.lineTo(jawOutline[0].x, leftEyeMin.y);
        jawOutlineMask.lineTo(jawOutline[0].x, leftEyeMax.y);
        jawOutlineMask.lineTo(jawOutline[0].x, jawOutline[0].y);

        ctx.clip(jawOutlineMask, 'evenodd');
    }

    private makeEyeFlap(
        leftEyeMinMax: MinMax,
        rightEyeMinMax: MinMax,
        jawMinMax: MinMax,
        eyeAngle: number,
        eyeCenter: Point,
        mouthEyeDistance: number
    ) {
        const [jawMin, jawMax] = jawMinMax;
        const [leftEyeMin, leftEyeMax] = leftEyeMinMax;
        const [rightEyeMin, rightEyeMax] = rightEyeMinMax;

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();

        const jawWidth = jawMax.x - jawMin.x;
        const origEyeFlapWidth = rightEyeMax.x - leftEyeMin.x;
        const jawWidthFactor = jawWidth / (origEyeFlapWidth);
        const eyeJawFlapWidth = origEyeFlapWidth * jawWidthFactor;

        const heightFactor = 1;
        const eyeFlapHeight = (rightEyeMax.y - rightEyeMin.y) * heightFactor;
        ctx.translate(eyeCenter.x, eyeCenter.y);
        ctx.rotate(-eyeAngle);
        ctx.scale(1.5, 1.5);
        //ctx.translate(0, mouthEyeDistance);
        ctx.rect(
            leftEyeMin.x - eyeCenter.x - (eyeJawFlapWidth / 4),
            leftEyeMin.y - eyeCenter.y  - (eyeJawFlapWidth / 4),
            eyeJawFlapWidth,
            eyeFlapHeight
        );
        ctx.rotate(eyeAngle);
        ctx.translate(-eyeCenter.x, -eyeCenter.y);

        ctx.fill();
        ctx.clip();
        ctx.drawImage(this.video!, 0, 0);

        ctx.restore();
    }

    private makeMouthFlap(
        mouthMinMax: MinMax,
        jawMinMax: MinMax,
        eyeAngle: number,
        mouthEyeDistance: number
    ) {
        const [mouthMin, mouthMax] = mouthMinMax;
        const [jawMin, jawMax] = jawMinMax;
        const mouthCenter = Point.getCenter([
            mouthMin,
            mouthMax,
            jawMin,
            jawMax
        ]);

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();

        ctx.translate(mouthCenter.x, mouthCenter.y);
        ctx.rotate(-eyeAngle);
        ctx.scale(this.mouthFlapScale, this.mouthFlapScale);
        ctx.translate(0, -mouthEyeDistance / this.mouthFlapScale / 2);
        ctx.rect(
            jawMin.x - mouthCenter.x,
            mouthMin.y - mouthCenter.y,
            jawMax.x - jawMin.x,
            mouthMax.y - mouthMin.y
        );
        ctx.rotate(eyeAngle);
        ctx.translate(-mouthCenter.x, -mouthCenter.y);

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
