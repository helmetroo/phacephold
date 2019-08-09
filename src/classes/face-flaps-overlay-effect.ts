import { FaceLandmarks68 } from 'face-api.js';

import Source from './source';
import OverlayEffect from './overlay-effect';
import FaceFlapsDrawer from './face-flaps-drawer';
import FaceMetadataExtractor, { Face } from './face-metadata-extractor';
import Maybe from './maybe';

export default class FaceFlapsOverlayEffect extends OverlayEffect {
    private faceFlapsDrawer: FaceFlapsDrawer = new FaceFlapsDrawer();
    private facePoints: Maybe<Face> = Maybe.none<Face>();

    public setFacePointsFromLandmarks(landmarks: FaceLandmarks68) {
        const facePoints = FaceMetadataExtractor.extract(landmarks);
        this.facePoints = Maybe.some(facePoints);
    }

    public async draw(source: Source, dest: HTMLCanvasElement) {
        this.facePoints.map(
            face =>
                this.faceFlapsDrawer.draw(source, dest, face)
        );
    }
}
