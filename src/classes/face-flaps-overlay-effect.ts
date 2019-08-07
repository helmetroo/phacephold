import { FaceLandmarks68 } from 'face-api.js';

import Source from './source';
import OverlayEffect from './overlay-effect';
import FaceDetector from './face-detector';
import FaceFlapsDrawer from './face-flaps-drawer';
import FaceMetadataExtractor from './face-metadata-extractor';
import Maybe from './maybe';

export default class FaceFlapsOverlayEffect extends OverlayEffect {
    private faceFlapsDrawer: FaceFlapsDrawer = new FaceFlapsDrawer();

    constructor(
        private readonly faceDetector: FaceDetector,
    ) {
        super();
    }

    public async draw(source: Source, dest: HTMLCanvasElement) {
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(source);

        if(faceLandmarkResult) {
            const landmarks = faceLandmarkResult.landmarks;
            this.drawFlaps(source, dest, landmarks);
        }
    }

    private drawFlaps(
        source: Source,
        dest: HTMLCanvasElement,
        landmarks: FaceLandmarks68
    ) {
        const face = FaceMetadataExtractor.extract(landmarks);
        this.faceFlapsDrawer.draw(source, dest, face);
    }
}
