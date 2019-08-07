import OverlayEffect from './overlay-effect';
import Source from './source';

export default class NoopOverlayEffect extends OverlayEffect {
    public async draw(source: Source, dest: HTMLCanvasElement) {}
}
