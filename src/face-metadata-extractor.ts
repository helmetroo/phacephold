import { FaceLandmarks68 } from 'face-api.js';

import Point, { MinMax } from './point';

export const enum DesignatedEye {
    LEFT,
    RIGHT
};

export interface Eye {
    readonly center: Point,
    readonly minMax: MinMax
};

export interface Eyes {
    readonly center: Point,
    readonly minMax: MinMax, // may delete
    readonly leftMinMax: MinMax,
    readonly rightMinMax: MinMax,
    readonly angle: number,
    readonly height: number
};

export interface Mouth {
    readonly center: Point,
    readonly minMax: MinMax
};

export interface Head {
    readonly center: Point,
    readonly minMax: MinMax
};

export interface Face {
    readonly eyes: Eyes,
    readonly mouth: Mouth,
    readonly head: Head
}

export default class FaceMetadataExtractor {
    public static extract(faceLandmarks: FaceLandmarks68) {
        const eyes = this.toEyesMetadata(faceLandmarks);
        const mouth = this.toMouthMetadata(faceLandmarks);
        const head = this.toHeadMetadata(faceLandmarks);

        const face: Face = {
            eyes,
            mouth,
            head
        }

        return face;
    }

    private static toEyesMetadata(faceLandmarks: FaceLandmarks68) {
        const leftEye = this.toEyeMetadata(faceLandmarks, DesignatedEye.LEFT);
        const rightEye = this.toEyeMetadata(faceLandmarks, DesignatedEye.RIGHT);

        const centerOfEyes = Point.getCenter([
            leftEye.center,
            rightEye.center
        ]);

        const angleBetweenEyes = -Point.angleBetween(leftEye.center, rightEye.center);

        const eyeMinMax = Point.getMinMaxForPoints([
            ...leftEye.minMax,
            ...rightEye.minMax
        ]);

        const [eyeMin, eyeMax] = eyeMinMax;
        const heightOfEye = Point.distanceBetween(eyeMax, eyeMin);

        const eyesMetadata: Eyes = {
            center: centerOfEyes,
            minMax: eyeMinMax,
            leftMinMax: leftEye.minMax,
            rightMinMax: rightEye.minMax,
            angle: angleBetweenEyes,
            height: heightOfEye,
        };

        return eyesMetadata;
    }

    private static toEyeMetadata(faceLandmarks: FaceLandmarks68, eye: DesignatedEye) {
        const eyeLandmark = (eye === DesignatedEye.LEFT)
            ? faceLandmarks.getLeftEye()
            : faceLandmarks.getRightEye();

        const eyePoints = eyeLandmark.map(Point.fromFaceApiPoint);
        const eyeCenter = Point.getCenter(eyePoints);
        const eyeMinMax = Point.getMinMaxForPoints(eyePoints);

        const eyeMetadata: Eye = {
            center: eyeCenter,
            minMax: eyeMinMax
        };

        return eyeMetadata;
    }

    private static toMouthMetadata(faceLandmarks: FaceLandmarks68) {
        const mouthPoints = faceLandmarks.getMouth()
            .map(Point.fromFaceApiPoint);

        const mouthCenter = Point.getCenter(mouthPoints);
        const mouthMinMax = Point.getMinMaxForPoints(mouthPoints);

        const mouthMetadata: Mouth = {
            center: mouthCenter,
            minMax: mouthMinMax
        };

        return mouthMetadata;
    }

    private static toHeadMetadata(faceLandmarks: FaceLandmarks68) {
        const headOutline = faceLandmarks.getJawOutline()
            .map(Point.fromFaceApiPoint);
        const headCenter = Point.getCenter(headOutline);
        const headMinMax = Point.getMinMaxForPoints(headOutline);

        const headMetadata: Head = {
            center: headCenter,
            minMax: headMinMax
        };

        return headMetadata;
    }
}
