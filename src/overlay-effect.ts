import FaceDetector from './face-detector';
import Source from './source';

export default abstract class OverlayEffect {
    constructor(
        protected readonly faceDetector: FaceDetector
    ) {}

    public async abstract draw(canvas: HTMLCanvasElement, source: Source): Promise<void>;
}
