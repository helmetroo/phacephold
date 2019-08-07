import FaceDetector from './face-detector';
import OverlayEffect from './overlay-effect';
import NoopOverlayEffect from './noop-overlay-effect';
import FaceFlapsOverlayEffect from './face-flaps-overlay-effect';
import Maybe from './maybe';

export enum EffectType {
    NONE,
    FLAPS,
}

type EffectSwitchHandlers = {
    [type in EffectType]: () => void
};

type EffectRetriever = {
    [EffectType.NONE]: () => NoopOverlayEffect,
    [EffectType.FLAPS]: () => FaceFlapsOverlayEffect | NoopOverlayEffect,
};

export default class EffectController {
    private currentEffectType: EffectType = EffectType.NONE;

    private noopEffect: NoopOverlayEffect = new NoopOverlayEffect();
    private faceFlapsEffect: Maybe<FaceFlapsOverlayEffect> = Maybe.none<FaceFlapsOverlayEffect>();

    private effectRetriever: EffectRetriever = {
        [EffectType.NONE]: () => this.noopEffect,
        [EffectType.FLAPS]: () => this.faceFlapsEffect.getOrElse(this.noopEffect)
    }

    public switchTo(effectType: EffectType) {
        this.currentEffectType = effectType;
        return this.getCurrent();
    }

    public initFaceFlapsOverlayEffect(faceDetector: FaceDetector) {
        const faceFlapsEffect = new FaceFlapsOverlayEffect(faceDetector);
        this.faceFlapsEffect = Maybe.some(faceFlapsEffect);
    }

    public getCurrent() {
        const retrieveEffect =
            this.effectRetriever[this.currentEffectType];

        return retrieveEffect();
    }
}
