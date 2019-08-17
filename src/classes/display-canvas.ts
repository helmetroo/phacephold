import Dimensions from './dimensions';
import RenderCanvas from './render-canvas';
import Maybe from './maybe';

export default class DisplayCanvas {
    private static readonly CANVAS_ID = 'display-canvas';

    private canvasElement: HTMLCanvasElement;
    private container: Maybe<HTMLElement> = Maybe.none<HTMLElement>();

    constructor() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = DisplayCanvas.CANVAS_ID;
        this.canvasElement.className = DisplayCanvas.CANVAS_ID;
    }

    public mount(container: HTMLElement) {
        this.container = Maybe.some(container);
        container.appendChild(this.canvasElement);
    }

    private computeDimensions(renderCanvas: RenderCanvas) {
        return this.container.map(container => {
            const renderCanvasElement = renderCanvas.getElement();
            const {
                width: renderCanvasWidth,
                height: renderCanvasHeight
            } = renderCanvasElement;

            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const widthRatio = containerWidth / renderCanvasWidth;
            const heightRatio = containerHeight / renderCanvasHeight;
            const minRatio = Math.min(widthRatio, heightRatio);
            const displayCanvasWidth = Math.ceil(minRatio * renderCanvasWidth);
            const displayCanvasHeight = Math.ceil(minRatio * renderCanvasHeight);
            const displayCanvasDims: Dimensions = {
                width: displayCanvasWidth,
                height: displayCanvasHeight
            };

            return displayCanvasDims;
        });
    }

    private setDimensions(dimensions: Dimensions) {
        const {
            width: canvasWidth,
            height: canvasHeight
        } = dimensions;

        this.canvasElement.width = canvasWidth;
        this.canvasElement.height = canvasHeight;
    }

    public computeAndSetDimensions(renderCanvas: RenderCanvas) {
        this.computeDimensions(renderCanvas).map(
            canvasDimensions => this.setDimensions(canvasDimensions)
        );
    }

    public drawFrameFrom(renderCanvas: RenderCanvas) {
        const ctx = this.canvasElement.getContext('2d');
        if(!ctx)
            return;

        const renderCanvasElement = renderCanvas.getElement();
        ctx.drawImage(renderCanvasElement, 0, 0,
                      this.canvasElement.width, this.canvasElement.height);
    }
}
