import Camera from './camera';
import RenderCanvas from './render-canvas';
import DisplayCanvas from './display-canvas';
import FaceDetector from './face-detector';
import FaceFlapsOverlayEffect from './face-flaps-overlay-effect';

// UI
import Loader from './loader';
import FPSCounter from './fps-counter';

export default class App {
    // Sources
    private camera: Camera | null = null;

    // Effects
    private faceFlapsEffect: FaceFlapsOverlayEffect | null = null;

    private faceDetector: FaceDetector = new FaceDetector();

    private renderCanvas: RenderCanvas | null = null;
    private displayCanvas: DisplayCanvas | null = null;

    private loaded: boolean = false;

    // UI
    private loader: Loader = new Loader();
    private fpsCounter: FPSCounter = new FPSCounter();

    public async init() {
        await this.initCamera();
        await this.initFaceDetector();
        this.initFaceFlapsEffect();
        this.initCanvasses();

        this.beginRender();

        this.hideLoader();
    }

    private async initCamera() {
        this.camera = new Camera();
        await this.camera.load();

        this.camera.play();
    }

    private async initFaceDetector() {
        await this.faceDetector.init();
    }

    private initFaceFlapsEffect() {
        this.faceFlapsEffect =
            new FaceFlapsOverlayEffect(this.faceDetector, this.camera!);
    }

    private initCanvasses() {
        this.renderCanvas = new RenderCanvas();
        this.renderCanvas.setSource(this.camera!);
        this.renderCanvas.setEffect(this.faceFlapsEffect!);

        this.displayCanvas = new DisplayCanvas(this.renderCanvas);
    }

    private beginRender() {
        const render = this.render.bind(this);
        requestAnimationFrame(render);
    }

    private async render() {
        if(!this.renderCanvas
           || !this.displayCanvas)
            return;

        await this.renderCanvas.draw();
        this.displayCanvas.drawRenderCanvasFrame();

        this.fpsCounter.update();

        this.beginRender();
    }

    private hideLoader() {
        this.loaded = true;
        this.loader.hide();
    }
}
