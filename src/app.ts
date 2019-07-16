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
    private eyeFlapScale: number = 1.5;
    private mouthFlapScale: number = 1.5;
    private overallScale: number = 1.15;

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

        this.drawVideo();

        if(faceLandmarkResult) {
            // Eye flap
            const leftEye = faceLandmarkResult.landmarks.getLeftEye()
                .map(Point.fromFaceApiPoint);
            const leftEyebrow = faceLandmarkResult.landmarks.getLeftEyeBrow()
                .map(Point.fromFaceApiPoint);
            const leftEyeBoundBox = this.getEyeBoundingBox(leftEye, leftEyebrow);
            const leftEyeMinMax = Point.getMinMaxForPoints(leftEyeBoundBox);

            const rightEye = faceLandmarkResult.landmarks.getRightEye()
                .map(Point.fromFaceApiPoint);
            const rightEyebrow = faceLandmarkResult.landmarks.getRightEyeBrow()
                .map(Point.fromFaceApiPoint);
            const rightEyeBoundBox = this.getEyeBoundingBox(rightEye, rightEyebrow);
            const rightEyeMinMax = Point.getMinMaxForPoints(rightEyeBoundBox);

            const leftEyeCenter = Point.getCenter(leftEyeBoundBox);
            const rightEyeCenter = Point.getCenter(rightEyeBoundBox);
            const eyeAngle = -Point.angleBetween(leftEyeCenter, rightEyeCenter);
            const eyeCenter = Point.getCenter([leftEyeCenter, rightEyeCenter]);
            const eyeMinMax = Point.getMinMaxForPoints([
                ...leftEyeMinMax,
                ...rightEyeMinMax
            ]);

            // Mouth flap
            const mouth = faceLandmarkResult.landmarks.getMouth()
                .map(Point.fromFaceApiPoint);
            const mouthMinMax = Point.getMinMaxForPoints(mouth);
            const [mouthMin] = mouthMinMax;
            const [, eyeMax] = eyeMinMax;
            const mouthEyeDistance = mouthMin.y - eyeMax.y;

            // Jaw
            const jawOutline = faceLandmarkResult.landmarks.getJawOutline()
                .map(Point.fromFaceApiPoint);
            const jawMinMax = Point.getMinMaxForPoints(jawOutline);

            const ctx = this.overlayCanvas!.getContext('2d');

            ctx!.save();

            ctx!.save();
            const jawCenter = Point.getCenter(jawOutline);
            ctx!.translate(jawCenter.x, jawCenter.y);
            ctx!.scale(this.overallScale, this.overallScale);
            ctx!.translate(-jawCenter.x, -jawCenter.y);

            this.drawFlaps(
                jawOutline,
                jawMinMax,
                leftEyeMinMax,
                rightEyeMinMax,
                eyeAngle,
                eyeCenter,
                mouthMinMax,
                mouthEyeDistance
            );

            ctx!.restore();
            //this.faceDetector.drawDebugOverlay(this.overlayCanvas!, faceLandmarkResult);

            ctx!.restore();
        }

        this.fpsCounter.update();

        this.hideLoaderIfNotHidden();
        this.beginDetectFaces();
    }

    // Bounding box includes eyebrows and an eye-sized space below the eye
    private getEyeBoundingBox(eye: Point[], eyebrow: Point[]) {
        const [eyeMin, eyeMax] = Point.getMinMaxForPoints(eye);
        const eyeHeight = eyeMax.y - eyeMin.y;
        // Maybe better if we take the eye angle into account below
        const newLeftEyeMax = eyeMax.add(new Point(0, 2*eyeHeight));
        const eyeBoundBox = [
            eyeMin,
            newLeftEyeMax,
            ...eyebrow
        ];

        return eyeBoundBox;
    }

    private drawVideo() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.drawImage(this.video!, 0, 0,
                      this.video!.offsetWidth, this.video!.offsetHeight);
    }

    private drawFlaps(
        jawOutline: Point[],
        jawMinMax: MinMax,
        leftEyeMinMax: MinMax,
        rightEyeMinMax: MinMax,
        eyeAngle: number,
        eyeCenter: Point,
        mouthMinMax: MinMax,
        mouthEyeDistance: number
    ) {
        this.createJawOutlineMask(jawOutline, leftEyeMinMax, rightEyeMinMax);
        this.makeEyeFlap(leftEyeMinMax, rightEyeMinMax, jawMinMax, eyeAngle, eyeCenter, mouthEyeDistance);
        this.makeMouthFlap(mouthMinMax, jawMinMax, eyeAngle, mouthEyeDistance);
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
        const jawWidthFactor = jawWidth / origEyeFlapWidth;
        const eyeJawFlapWidth = origEyeFlapWidth * jawWidthFactor;
        let eyeFlapHeight = (eyeAngle >= 0)
            ? (leftEyeMax.y - rightEyeMin.y)
            : (rightEyeMax.y - leftEyeMin.y);
        ctx.translate(eyeCenter.x, eyeCenter.y);
        ctx.rotate(-eyeAngle);
        ctx.scale(this.eyeFlapScale, this.eyeFlapScale);
        ctx.translate(0, (mouthEyeDistance - (eyeFlapHeight / 2)) / this.eyeFlapScale / 2);

        ctx.rect(
            leftEyeMin.x - eyeCenter.x,
            leftEyeMin.y - eyeCenter.y,
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
