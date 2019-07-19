import { Face, Eyes } from './face-metadata-extractor';
import Point from './point';

export default class FaceFlapsDrawer {
    // Possibly tweakable attrs
    private eyeFlapScale: number = 1.35;
    private mouthFlapScale: number = 1.35;
    private overallScale: number = 1.25;

    constructor(
        private readonly ctx: CanvasRenderingContext2D,
        private readonly sourceVideo: HTMLVideoElement
    ) {}

    public draw(face: Face) {
        const ctx = this.ctx;

        ctx.save();
        ctx.save();

        const faceCenter = face.head.center;
        ctx.translate(faceCenter.x, faceCenter.y);
        ctx.scale(this.overallScale, this.overallScale);
        ctx.translate(-faceCenter.x, -faceCenter.y);

        this.drawFlaps(face);

        ctx.restore();
        ctx.restore();
    }

    private drawFlaps(face: Face) {
        this.drawEyesFlap(face);
    }

    private drawEyesFlap(face: Face) {
        const ctx = this.ctx;
        const {
            eyes: {
                center: eyeCenter,
                angle: eyeAngle
            }
        } = face;

        ctx.save();
        ctx.beginPath();

        ctx.translate(eyeCenter.x, eyeCenter.y);
        ctx.rotate(-eyeAngle);
        ctx.scale(this.eyeFlapScale, this.eyeFlapScale);

        const eyesFlap = this.getEyesFlap(face.eyes);
        ctx.fill(eyesFlap);
        ctx.clip(eyesFlap);

        ctx.rotate(eyeAngle);
        ctx.translate(-eyeCenter.x, -eyeCenter.y);

        ctx.drawImage(this.sourceVideo, 0, 0);

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

        const horizEyeHeightOffset = new Point(0.35 * eyeHeight, 0);
        const vertEyeHeightOffset = new Point(0, eyeHeight * 0.2);
        const eyeHeightOffset = vertEyeHeightOffset
            .add(horizEyeHeightOffset);

        // Scaling
        /*
        const eyeMinMaxXDiff = (eyeMax.x - eyeMin.x);
        const eyeMinMaxXDiffSq = eyeMinMaxXDiff * eyeMinMaxXDiff;

        const eyeMinMaxYDiff = (eyeMax.y - eyeMin.y);
        const eyeMinMaxYDiffSq = eyeMinMaxYDiff * eyeMinMaxYDiff;

        const eyeHeightSq = (0.75 * 0.75) * (eyeHeight * eyeHeight);
        const scalingFactor = Math.sqrt(
            eyeHeightSq / (eyeMinMaxXDiffSq + eyeMinMaxYDiffSq)
        );
        */

        // Unflattened code
        /*
        const unrotatedEyeMin = Point.rotate(eyeMin, -absAngle);
        const newUnrotatedEyeMin = unrotatedEyeMin.subtract(eyeHeightOffset);
        const rotatedEyeMin = Point.rotate(newUnrotatedEyeMin, absAngle);
        const newEyeMin = rotatedEyeMin.subtract(eyeCenter);

        const unrotatedEyeMax = Point.rotate(eyeMax, -absAngle);
        const newUnrotatedEyeMax = unrotatedEyeMax.add(eyeHeightOffset);
        const rotatedEyeMax = Point.rotate(newUnrotatedEyeMax, absAngle);
        const newEyeMax = rotatedEyeMax.subtract(eyeCenter);
        */

        /*
        const newEyeMin = eyeMin
            .rotate(-absAngle)
            .subtract(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newEyeMax = eyeMax
            .rotate(-absAngle)
            .add(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        eyesFlap.moveTo(newEyeMin.x, newEyeMin.y);
        eyesFlap.lineTo(newEyeMax.x, newEyeMin.y);
        eyesFlap.lineTo(newEyeMax.x, newEyeMax.y);
        eyesFlap.lineTo(newEyeMin.x, newEyeMax.y);
        eyesFlap.lineTo(newEyeMin.x, newEyeMin.y);
        */

        /*
        const newLeftEyeMin = leftEyeMin
            .rotate(-absAngle)
            .subtract(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newLeftEyeMax = leftEyeMax
            .rotate(-absAngle)
            .add(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newRightEyeMin = rightEyeMin
            .rotate(-absAngle)
            .subtract(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newRightEyeMax = rightEyeMax
            .rotate(-absAngle)
            .add(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        eyesFlap.moveTo(newLeftEyeMin.x, newLeftEyeMin.y);
        eyesFlap.lineTo(newRightEyeMax.x, newRightEyeMin.y);
        eyesFlap.lineTo(newRightEyeMax.x, newRightEyeMax.y);
        eyesFlap.lineTo(newLeftEyeMin.x, newLeftEyeMax.y);
        eyesFlap.lineTo(newLeftEyeMin.x, newLeftEyeMin.y);
        */

        const newEyeMin = eyeMin
            .rotate(-absAngle)
            .subtract(eyeHeightOffset)
            .rotate(absAngle)
            .subtract(eyeCenter);

        const newEyeMax = eyeMax
            .rotate(-absAngle)
            .add(eyeHeightOffset)
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
}
