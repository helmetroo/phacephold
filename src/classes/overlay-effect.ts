import FaceDetector from './face-detector';
import Source from './source';
import Maybe from './maybe';

export default abstract class OverlayEffect {
    public abstract async draw(source: Source, dest: HTMLCanvasElement): Promise<void>;
}
