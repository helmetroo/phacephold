import Dimensions from './dimensions';
import RenderCanvas from './render-canvas';

export default class DisplayCanvas {
    private static readonly CONTAINER_ID = 'display-container';
    private static readonly CANVAS_ID = 'display-canvas';

    private container: HTMLElement;
    private canvasElement: HTMLCanvasElement;

    constructor(
        private readonly renderCanvas: RenderCanvas
    ) {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.id = DisplayCanvas.CANVAS_ID;
        this.canvasElement.className = DisplayCanvas.CANVAS_ID;

        this.container =
            document.getElementById(DisplayCanvas.CONTAINER_ID)!;

        // TODO on window resize, canvas dimensions need to change
        this.computeAndSetDimensions();
        this.container.appendChild(this.canvasElement);
    }

    private computeDimensions() {
        const renderCanvasElement = this.renderCanvas.getElement();
        const {
            width: renderCanvasWidth,
            height: renderCanvasHeight
        } = renderCanvasElement;

        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;

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
    }

    private setDimensions(dimensions: Dimensions) {
        const {
            width: canvasWidth,
            height: canvasHeight
        } = dimensions;

        this.canvasElement.width = canvasWidth;
        this.canvasElement.height = canvasHeight;
    }

    public computeAndSetDimensions() {
        const canvasDimensions = this.computeDimensions();
        this.setDimensions(canvasDimensions);
    }

    public drawRenderCanvasFrame() {
        const ctx = this.canvasElement.getContext('2d');
        if(!ctx)
            return;

        const renderCanvasElement = this.renderCanvas.getElement();
        ctx.drawImage(renderCanvasElement, 0, 0,
                      this.canvasElement.width, this.canvasElement.height);
    }
}
