import { Face, Eyes, Mouth, Head } from './face-metadata-extractor';
import Point from './point';
import Source from './source';

export default class FaceFlapsDrawer {
    private eyeFlapScale: number = 1.35;
    private mouthFlapScale: number = 1.35;
    private overallScale: number = 1.25;

    constructor(
        private source: Source
    ) {}

    public draw(canvas: HTMLCanvasElement, face: Face) {
        const ctx = canvas.getContext('2d');
        if(!ctx || !this.source)
            return;

        ctx.save();

        const {
            head: {
                center: faceCenter
            }
        } = face;
        ctx.translate(faceCenter.x, faceCenter.y);
        ctx.scale(this.overallScale, this.overallScale);
        ctx.translate(-faceCenter.x, -faceCenter.y);

        this.drawFlaps(ctx, face);

        ctx.restore();
    }

    private drawSource(ctx: CanvasRenderingContext2D) {
        if(!this.source)
            return;

        const canvasImageSource = this.source.getProcessableSource();
        ctx.drawImage(canvasImageSource, 0, 0);
    }

    private drawFlaps(ctx: CanvasRenderingContext2D, face: Face) {
        const {
            head,
            eyes,
            mouth
        } = face;

        this.drawHeadMask(ctx, head);
        this.drawMouthFlap(ctx, mouth, eyes.angle);
        this.drawEyesFlap(ctx, eyes);
    }

    private drawEyesFlap(ctx: CanvasRenderingContext2D, eyes: Eyes) {
        const {
            center: eyeCenter,
            angle: eyeAngle,
            height: eyeHeight
        } = eyes;

        ctx.save();
        ctx.beginPath();

        ctx.translate(eyeCenter.x, eyeCenter.y);

        const eyeOffset = new Point(0, eyeHeight * 0.2);
        ctx.translate(eyeOffset.x, eyeOffset.y);

        ctx.rotate(-eyeAngle);
        ctx.scale(this.eyeFlapScale, this.eyeFlapScale);

        const eyesFlap = this.getEyesFlap(eyes);
        ctx.fill(eyesFlap);
        ctx.clip(eyesFlap);

        ctx.rotate(eyeAngle);
        ctx.translate(-eyeCenter.x, -eyeCenter.y);

        this.drawSource(ctx);

        ctx.restore();
    }

    private getEyesFlap(eyes: Eyes) {
        const eyesFlap = new Path2D();

        const {
            center: eyeCenter,
            minMax: eyeMinMax,
            leftMinMax: leftEyeMinMax,
            rightMinMax: rightEyeMinMax,
            angle: eyeAngle,
            height: eyeHeight,
        } = eyes;

        const [eyeMin, eyeMax] = eyeMinMax;
        const [leftEyeMin, leftEyeMax] = leftEyeMinMax;
        const [rightEyeMin, rightEyeMax] = rightEyeMinMax;
        const absAngle = Math.abs(eyeAngle);

        const eyeHeightScale = new Point(
            0.35 * eyeHeight,
            0.15 * eyeHeight
        );

        const newEyeMin = eyeMin
            .rotate(-absAngle)
            .subtract(eyeHeightScale)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newEyeMax = eyeMax
            .rotate(-absAngle)
            .add(eyeHeightScale)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const unrotatedNewEyeMin = newEyeMin.rotate(-absAngle);
        const unrotatedNewEyeMax = newEyeMax.rotate(-absAngle);
        eyesFlap.rect(
            unrotatedNewEyeMin.x,
            unrotatedNewEyeMin.y,
            unrotatedNewEyeMax.x - unrotatedNewEyeMin.x,
            unrotatedNewEyeMax.y - unrotatedNewEyeMin.y
        );

        return eyesFlap;
    }

    private drawMouthFlap(ctx: CanvasRenderingContext2D, mouth: Mouth, eyeAngle: number) {
        const {
            center: mouthCenter,
            height: mouthHeight
        } = mouth;

        ctx.save();
        ctx.beginPath();

        ctx.translate(mouthCenter.x, mouthCenter.y);

        const mouthOffset = new Point(0, -mouthHeight * 0.25);
        ctx.translate(mouthOffset.x, mouthOffset.y);

        ctx.rotate(-eyeAngle);
        ctx.scale(this.mouthFlapScale, this.mouthFlapScale);

        const mouthFlap = this.getMouthFlap(mouth);
        ctx.fill(mouthFlap);
        ctx.clip(mouthFlap);

        ctx.rotate(eyeAngle);
        ctx.translate(-mouthCenter.x, -mouthCenter.y);

        this.drawSource(ctx);

        ctx.restore();
    }

    private getMouthFlap(mouth: Mouth) {
        const mouthFlap = new Path2D();
        const {
            center: mouthCenter,
            minMax: mouthMinMax,
            height: mouthHeight
        } = mouth;

        const [mouthMin, mouthMax] = mouthMinMax;

        const mouthWidth = mouthMax.x - mouthMin.x;
        const mouthWidthScale = 2 * mouthWidth;
        const mouthHeightScale = 0.5 * mouthHeight;

        const mouthScaleVec = new Point(
            mouthWidthScale / 2,
            mouthHeightScale / 2
        );

        const newMouthMin = mouthMin
            .subtract(mouthScaleVec)
            .subtract(mouthCenter);

        const newMouthMax = mouthMax
            .add(mouthScaleVec)
            .subtract(mouthCenter);

        mouthFlap.rect(
            newMouthMin.x,
            newMouthMin.y,
            (mouthMax.x - mouthMin.x) + mouthWidthScale,
            (mouthMax.y - mouthMin.y) + mouthHeightScale
        );

        return mouthFlap;
    }

    private getHeadMask(head: Head) {
        const headMask = new Path2D();
        const {
            points: bottomHeadPoints
        } = head;

        const topHeadPoints =
            bottomHeadPoints.map(point => point.reflectXAxis());

        const headPoints = [
            ...bottomHeadPoints,
            ...topHeadPoints
        ];

        const firstHeadPoint = headPoints[0];
        headMask.moveTo(firstHeadPoint.x, firstHeadPoint.y);

        const numHeadPoints = headPoints.length;
        for(let index = 1; index < numHeadPoints; ++index) {
            const currentPoint = headPoints[index];
            headMask.lineTo(currentPoint.x, currentPoint.y);
        }

        headMask.lineTo(firstHeadPoint.x, firstHeadPoint.y);

        return headMask;
    }

    private drawHeadMask(ctx: CanvasRenderingContext2D, head: Head) {
        const headMask = this.getHeadMask(head);

        ctx.clip(headMask, 'evenodd');
    }
}
