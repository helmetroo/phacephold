import { FaceLandmarks68 } from 'face-api.js';

import FaceDetector from './face-detector';
import OverlayEffect from './overlay-effect';
import NoopOverlayEffect from './noop-overlay-effect';
import FaceFlapsOverlayEffect from './face-flaps-overlay-effect';

export default class EffectController {
    private noopEffect: NoopOverlayEffect = new NoopOverlayEffect();
    private faceFlapsEffect: FaceFlapsOverlayEffect = new FaceFlapsOverlayEffect();

    public getNoop() {
        return this.noopEffect;
    }

    public getFaceFlaps(landmarks: FaceLandmarks68) {
        this.faceFlapsEffect.setFacePointsFromLandmarks(landmarks);
        return this.faceFlapsEffect;
    }
}
