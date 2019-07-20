import { FaceLandmarks68 } from 'face-api.js';

import FaceDetector, { FaceLandmarksResult } from './face-detector';
import Point, { MinMax } from './point';

// UI
import Loader from './loader';
import FPSCounter from './fps-counter';
import FaceFlapsDrawer from './face-flaps-drawer';
import FaceMetadataExtractor from './face-metadata-extractor';

class App {
    private static readonly VIDEO_ID = '#video';
    private static readonly OVERLAY_CANVAS_ID = '#video-overlay';

    private faceDetector: FaceDetector = new FaceDetector();
    private faceFlapsDrawer: FaceFlapsDrawer | null = null;

    private video: HTMLVideoElement | null = null;
    private overlayCanvas: HTMLCanvasElement | null = null;

    private loaded: boolean = false;

    private loader: Loader = new Loader();
    private fpsCounter: FPSCounter = new FPSCounter();

    // Possibly tweakable attrs
    private eyeFlapScale: number = 1.5;
    private mouthFlapScale: number = 1.5;
    private overallScale: number = 1.25;

    public async init() {
        await this.initVideo();
        await this.initFaceDetector();

        this.initOverlayCanvas();
        this.initFlapsDrawer();
        this.beginDraw();
        this.hideLoaderIfNotHidden();
    }

    private async initVideo() {
        const stream = await (navigator as Navigator).mediaDevices
            .getUserMedia({ video: true });

        this.video =
            document.querySelector<HTMLVideoElement>(App.VIDEO_ID)!;
        this.video.srcObject = stream;

        return new Promise((resolve, reject) => {
            this.video!.onloadedmetadata = resolve;
        });
    }

    private async initFaceDetector() {
        return this.faceDetector.init();
    }

    private initOverlayCanvas() {
        this.overlayCanvas = this.initCanvas(App.OVERLAY_CANVAS_ID);
    }

    private initCanvas(id: string) {
        const canvas =
            document.querySelector<HTMLCanvasElement>(id)!;

        canvas.setAttribute('width', String(this.video!.offsetWidth));
        canvas.setAttribute('height', String(this.video!.offsetHeight));

        return canvas;
    }

    private initFlapsDrawer() {
        const ctx = this.overlayCanvas!.getContext('2d')!;
        const sourceVideo = this.video!;

        this.faceFlapsDrawer = new FaceFlapsDrawer(ctx, sourceVideo);
    }

    private beginDraw() {
        requestAnimationFrame(this.draw.bind(this));
    }

    private async draw() {
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(this.video!);

        this.clear();
        this.drawVideo();

        if(faceLandmarkResult)
            this.drawFlaps(faceLandmarkResult.landmarks);

        this.fpsCounter.update();

        this.beginDraw();
    }

    private drawVideo() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.drawImage(this.video!, 0, 0,
                      this.video!.offsetWidth, this.video!.offsetHeight);
    }

    private drawFlaps(landmarks: FaceLandmarks68) {
        const face = FaceMetadataExtractor.extract(landmarks);
        this.faceFlapsDrawer!.draw(face);
    }

    private hideLoaderIfNotHidden() {
        if(!this.loaded) {
            this.loaded = true;
            this.loader.hide();
        }
    }

    private clear() {
        const ctx = this.overlayCanvas!.getContext('2d');
        if(!ctx)
            return;

        ctx.clearRect(0, 0, this.overlayCanvas!.width, this.overlayCanvas!.height);
    }
}

export default App;
