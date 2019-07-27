import { FaceLandmarks68 } from 'face-api.js';

import Source from './source';
import OverlayEffect from './overlay-effect';
import FaceDetector from './face-detector';
import FaceFlapsDrawer from './face-flaps-drawer';
import FaceMetadataExtractor from './face-metadata-extractor';

export default class FaceFlapsOverlayEffect extends OverlayEffect {
    private faceFlapsDrawer: FaceFlapsDrawer;

    constructor(
        protected faceDetector: FaceDetector,
        private source: Source
    ) {
        super(faceDetector);
        this.faceFlapsDrawer = new FaceFlapsDrawer(source);
    }

    public async draw(canvas: HTMLCanvasElement) {
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(this.source);

        if(faceLandmarkResult) {
            const landmarks = faceLandmarkResult.landmarks;
            this.drawFlaps(canvas, landmarks);
        }
    }

    private drawFlaps(canvas: HTMLCanvasElement, landmarks: FaceLandmarks68) {
        const face = FaceMetadataExtractor.extract(landmarks);
        this.faceFlapsDrawer.draw(canvas, face);
    }
}
