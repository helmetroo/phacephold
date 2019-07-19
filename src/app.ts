import { FaceLandmarks68 } from 'face-api.js';

import FaceDetector, { FaceLandmarksResult } from './face-detector';
import Point, { MinMax } from './point';

// UI
import Loader from './loader';
import FPSCounter from './fps-counter';
import FaceFlapsDrawer from './face-flaps-drawer';
import FaceMetadataExtractor from './face-metadata-extractor';

class App {
    private static readonly VIDEO_ID = '#video';
    private static readonly OVERLAY_CANVAS_ID = '#video-overlay';

    private faceDetector: FaceDetector = new FaceDetector();
    private faceFlapsDrawer: FaceFlapsDrawer | null = null;

    private video: HTMLVideoElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;

    private loaded: boolean = false;

    private loader: Loader = new Loader();
    private fpsCounter: FPSCounter = new FPSCounter();

    // Possibly tweakable attrs
    private eyeFlapScale: number = 1.5;
    private mouthFlapScale: number = 1.5;
    private overallScale: number = 1.25;

    public async init() {
        await this.initVideo();
        await this.initFaceDetector();

        this.initOverlayCanvas();
        this.initFlapsDrawer();
        this.beginDraw();
        this.hideLoaderIfNotHidden();
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

    private initFlapsDrawer() {
        const ctx = this.overlayCanvas!.getContext('2d')!;
        const sourceVideo = this.video!;

        this.faceFlapsDrawer = new FaceFlapsDrawer(ctx, sourceVideo);
    }

    private initCanvas(id: string) {
        const canvas =
            document.querySelector<HTMLCanvasElement>(id)!;

        canvas.setAttribute('width', String(this.video!.offsetWidth));
        canvas.setAttribute('height', String(this.video!.offsetHeight));

        return canvas;
    }

    private beginDraw() {
        requestAnimationFrame(this.draw.bind(this));
    }

    private async draw() {
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(this.video!);

        this.clear();
        this.drawVideo();

        if(faceLandmarkResult) {
            /*
            const faceLandmarks = faceLandmarkResult.landmarks;
            this.drawFlapsFromFaceLandmarks(faceLandmarks);
            */

            const face = FaceMetadataExtractor.extract(faceLandmarkResult.landmarks);
            this.faceFlapsDrawer!.draw(face);
        }

        this.fpsCounter.update();

        this.beginDraw();
    }

    private drawVideo() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.drawImage(this.video!, 0, 0,
                      this.video!.offsetWidth, this.video!.offsetHeight);
    }

    private hideLoaderIfNotHidden() {
        if(!this.loaded) {
            this.loaded = true;
            this.loader.hide();
        }
    }

    private drawFlapsFromFaceLandmarks(faceLandmarks: FaceLandmarks68) {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        // Eye flap
        const leftEye = faceLandmarks.getLeftEye()
            .map(Point.fromFaceApiPoint);
        const leftEyeCenter = Point.getCenter(leftEye);
        const leftEyeMinMax = Point.getMinMaxForPoints(leftEye);

        const rightEye = faceLandmarks.getRightEye()
            .map(Point.fromFaceApiPoint);
        const rightEyeCenter = Point.getCenter(rightEye);
        const rightEyeMinMax = Point.getMinMaxForPoints(rightEye);

        const eyeCenter = Point.getCenter([leftEyeCenter, rightEyeCenter]);
        const eyeAngle = -Point.angleBetween(leftEyeCenter, rightEyeCenter);
        //const eyeMinMaxForCalcingHeight = Point.getMinMaxForPoints(rightEye);
        //const eyeHeight = this.getEyeHeight(eyeMinMaxForCalcingHeight, eyeAngle);
        //const scaledEyeHeight = (eyeHeight * 3);
        //console.log(eyeAngle * (180/Math.PI));
        //console.log(eyeHeight);

        /*
        const leftEyeBoundBox = this.getEyeBoundingBox(leftEyeMinMax, eyeAngle, eyeHeight);
        const adjustedLeftEyeMinMax = Point.getMinMaxForPoints(leftEyeBoundBox);

        const rightEyeBoundBox = this.getEyeBoundingBox(rightEyeMinMax, eyeAngle, eyeHeight);
        const adjustedRightEyeMinMax = Point.getMinMaxForPoints(rightEyeBoundBox);
        */

        const eyeMinMax = Point.getMinMaxForPoints([
            ...leftEyeMinMax,
            ...rightEyeMinMax
        ]);

        // Mouth flap
        const mouth = faceLandmarks.getMouth()
            .map(Point.fromFaceApiPoint);
        const mouthMinMax = Point.getMinMaxForPoints(mouth);
        const [mouthMin] = mouthMinMax;
        const [, eyeMax] = eyeMinMax;
        const mouthEyeDistance = (mouthMin.y - eyeMax.y) * this.eyeFlapScale;

        // Jaw
        const jawOutline = faceLandmarks.getJawOutline()
            .map(Point.fromFaceApiPoint);
        const jawMinMax = Point.getMinMaxForPoints(jawOutline);

        ctx.save();
        ctx.save();

        const jawCenter = Point.getCenter(jawOutline);
        ctx.translate(jawCenter.x, jawCenter.y);
        ctx.scale(this.overallScale, this.overallScale);
        ctx.translate(-jawCenter.x, -jawCenter.y);

        this.drawFlaps(
            jawOutline,
            jawMinMax,
            eyeMinMax,
            eyeAngle,
            eyeCenter,
            mouthMinMax,
            mouthEyeDistance
        );

        ctx.restore();
        ctx.restore();
    }

    private getEyeHeight(eyeMinMax: MinMax, eyeAngle: number) {
        const [eyeMin, eyeMax] = eyeMinMax;

        const correctionAngle = (eyeAngle >= 0) ? eyeAngle : -eyeAngle;
        const rotEyeMin = Point.rotate(eyeMin, correctionAngle);
        const rotEyeMax = Point.rotate(eyeMax, correctionAngle);
        const eyeHeight = Math.abs(rotEyeMax.y - rotEyeMin.y);
        return eyeHeight;
    }

    // Bounding box includes an eye-sized space below and above the eye
    private getEyeBoundingBox(eyeMinMax: MinMax, eyeAngle: number, eyeHeight: number) {
        const [eyeMin, eyeMax] = eyeMinMax;

        const offset = new Point(0, eyeHeight);
        const correctionAngle = (eyeAngle >= 0) ? -eyeAngle : eyeAngle;
        const eyeOffset = Point.rotate(offset, correctionAngle);
        const newEyeMin = eyeMin.subtract(eyeOffset);
        const newEyeMax = eyeMax.add(eyeOffset);
        const eyeBoundBox = [
            newEyeMin,
            newEyeMax
        ];

        return eyeBoundBox;
    }

    private drawFlaps(
        jawOutline: Point[],
        jawMinMax: MinMax,
        eyeMinMax: MinMax,
        eyeAngle: number,
        eyeCenter: Point,
        mouthMinMax: MinMax,
        mouthEyeDistance: number
    ) {
        //this.createJawOutlineMask(jawOutline, eyeMinMax, eyeAngle);
        this.makeEyeFlap(eyeMinMax, jawMinMax, eyeAngle, eyeCenter, mouthEyeDistance);
        this.makeMouthFlap(mouthMinMax, jawMinMax, eyeAngle, mouthEyeDistance);
    }

    private createJawOutlineMask(
        jawOutline: Point[],
        eyeMinMax: MinMax,
        eyeAngle: number
    ) {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        const [eyeMin, eyeMax] = eyeMinMax;
        const compensationAngle = -Math.abs(eyeAngle);
        const compensatedEyeMax = Point.rotate(eyeMax, compensationAngle);
        const compensatedEyeMin = Point.rotate(eyeMin, compensationAngle);
        const extraHeight = (compensatedEyeMax.y - compensatedEyeMin.y) * 1.5;

        const jawOutlineMask = new Path2D();
        jawOutlineMask.moveTo(jawOutline[0].x, eyeMin.y - extraHeight);
        for(let index = 1; index < jawOutline.length; ++index) {
            jawOutlineMask.lineTo(jawOutline[index].x, jawOutline[index].y);
        }

        //jawOutlineMask.lineTo(jawOutline[jawOutline.length - 1].x, eyeMax.y);
        //jawOutlineMask.lineTo(jawOutline[jawOutline.length - 1].x, eyeMin.y);
        //jawOutlineMask.lineTo(jawOutline[0].x, eyeMin.y);
        //jawOutlineMask.lineTo(jawOutline[0].x, eyeMax.y);
        jawOutlineMask.lineTo(jawOutline[0].x, eyeMin.y  - extraHeight);

        ctx.clip(jawOutlineMask, 'evenodd');
    }

    private makeEyeFlap(
        eyeMinMax: MinMax,
        jawMinMax: MinMax,
        eyeAngle: number,
        eyeCenter: Point,
        mouthEyeDistance: number
    ) {
        const [jawMin, jawMax] = jawMinMax;
        const [eyeMin, eyeMax] = eyeMinMax;

        /*
        const [leftEyeMin, leftEyeMax] = leftEyeMinMax;
        const [rightEyeMin, rightEyeMax] = rightEyeMinMax;
        */

        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.save();
        ctx.beginPath();

        /*
        const jawWidth = jawMax.x - jawMin.x;
        const origEyeFlapWidth = rightEyeMax.x - leftEyeMin.x;
        const jawWidthFactor = jawWidth / origEyeFlapWidth;
        const eyeJawFlapWidth = origEyeFlapWidth * jawWidthFactor;
        */

        ctx.translate(eyeCenter.x, eyeCenter.y);
        ctx.rotate(-eyeAngle);
        ctx.scale(this.eyeFlapScale, this.eyeFlapScale);
        //ctx.translate(0, (mouthEyeDistance - (eyeHeight / 2)) / this.eyeFlapScale / 2);

        /*
        ctx.rect(
            leftEyeMin.x - eyeCenter.x,
            leftEyeMin.y - eyeCenter.y,
            eyeJawFlapWidth,
            eyeHeight
        );
        */

        const compensationAngle = -Math.abs(eyeAngle);
        const compensatedEyeMax = Point.rotate(eyeMax, compensationAngle);
        const compensatedEyeMin = Point.rotate(eyeMin, compensationAngle);
        const extraWidth = (compensatedEyeMax.x - compensatedEyeMin.x) * 0.5;
        const extraHeight = (compensatedEyeMax.y - compensatedEyeMin.y) * 1.05;

        const minXFromCenter = (eyeMin.x - extraWidth) - eyeCenter.x;
        const maxXFromCenter = (eyeMax.x + extraWidth) - eyeCenter.x;

        const minYFromCenter = (eyeMin.y - extraHeight) - eyeCenter.y;
        const maxYFromCenter = (eyeMax.y + extraHeight) - eyeCenter.y;

        ctx.moveTo(minXFromCenter, minYFromCenter);
        ctx.lineTo(maxXFromCenter, minYFromCenter);
        ctx.lineTo(maxXFromCenter, maxYFromCenter);
        ctx.lineTo(minXFromCenter, maxYFromCenter);
        ctx.lineTo(minXFromCenter, minYFromCenter);

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
        const path = new Path2D();
        path.rect(
            jawMin.x - mouthCenter.x,
            mouthMin.y - mouthCenter.y,
            jawMax.x - jawMin.x,
            mouthMax.y - mouthMin.y
        );
        ctx.fill(path);
        ctx.clip(path);

        ctx.rotate(eyeAngle);
        ctx.translate(-mouthCenter.x, -mouthCenter.y);

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
