import Maybe from './maybe';
import Source from './source';
import OverlayEffect from './overlay-effect';

export default class RenderCanvas {
    private static readonly CANVAS_ID = 'render-canvas';

    private canvasElement: HTMLCanvasElement;
    private source: Maybe<Source> = Maybe.none<Source>();
    private effect: Maybe<OverlayEffect> = Maybe.none<OverlayEffect>();

    constructor() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = RenderCanvas.CANVAS_ID;
        this.canvasElement.className = RenderCanvas.CANVAS_ID;

        this.canvasElement.style.display = 'none';
    }

    public getElement() {
        return this.canvasElement;
    }

    public setSource(source: Source) {
        this.source = Maybe.some(source);

        const {
            width: sourceWidth,
            height: sourceHeight
        } = source.getDimensions();

        this.canvasElement.width = sourceWidth;
        this.canvasElement.height = sourceHeight;
    }

    public setEffect(effect: OverlayEffect) {
        this.effect = Maybe.some(effect);
    }

    private clear() {
        this.fromCanvasContext(ctx => {
            const canvasWidth = this.canvasElement.width;
            const canvasHeight = this.canvasElement.height;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        });
    }

    private fromCanvasContext(callback: (ctx: CanvasRenderingContext2D) => void) {
        const maybeCtx = Maybe.fromValue(
            this.canvasElement.getContext('2d')
        );

        return maybeCtx.map(callback);
    }

    public async draw() {
        this.clear();

        this.drawSource(this.source);
        await this.drawEffect(this.effect, this.source);
    }

    private drawSource(maybeSource: Maybe<Source>) {
        this.fromCanvasContext(ctx => {
            maybeSource.map(source => {
                const rawSource = source.getRawSource();
                ctx.drawImage(rawSource, 0, 0);
            });
        });
    }

    private async drawEffect(
        maybeEffect: Maybe<OverlayEffect>,
        maybeSource: Maybe<Source>
    ) {
        return maybeEffect.flatMapAsync(
            effect =>
                maybeSource.mapAsync(
                    source => effect.draw(source, this.canvasElement)
                )
        );
    }
}
