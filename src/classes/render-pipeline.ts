import CameraSource from './camera-source';
import RenderCanvas from './render-canvas';
import DisplayCanvas from './display-canvas';
import OverlayEffect from './overlay-effect';
import Source from './source';
import Maybe from './maybe';

export default class RenderPipeline {
    private currentSource: Maybe<Source> = Maybe.none<Source>();
    private currentEffect: Maybe<OverlayEffect> = Maybe.none<OverlayEffect>();

    private renderCanvas: RenderCanvas = new RenderCanvas();
    private displayCanvas: DisplayCanvas = new DisplayCanvas();

    public mount(container: HTMLElement) {
        this.displayCanvas.mount(container);
    }

    public setSource(source: Source) {
        this.currentSource = Maybe.some(source);

        this.renderCanvas.setSource(source);
        this.displayCanvas.computeAndSetDimensions(this.renderCanvas);
    }

    public setEffect(effect: OverlayEffect) {
        this.currentEffect = Maybe.some(effect);
        this.renderCanvas.setEffect(effect);
    }

    public async render() {
        await this.renderCanvas.draw();
        this.displayCanvas.drawFrameFrom(this.renderCanvas);

        //this.fpsCounter.update();
    }
}
