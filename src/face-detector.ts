import {
    FaceLandmarks68,
    WithFaceLandmarks,
    FaceDetection,
    TinyFaceDetectorOptions
} from 'face-api.js';
import Source from './source';

export type FaceLandmarks =
    FaceLandmarks68;

// Inferred from emacs typescript-mode
export type FaceLandmarksResult =
    WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks>;

export default class FaceDetector {
    private static readonly MODEL_LOCATION: string = '/data';
    private static readonly DEFAULT_INPUT_SIZE: number = 224;
    private static readonly DEFAULT_SCORE_THRESHOLD: number = 0.5;

    private faceapi: typeof import('face-api.js') | null = null;

    private loadedFaceApi: boolean = false;
    private loadedFaceApiModel: boolean = false;

    private options: TinyFaceDetectorOptions
        = new TinyFaceDetectorOptions({
            inputSize: FaceDetector.DEFAULT_INPUT_SIZE,
            scoreThreshold: FaceDetector.DEFAULT_SCORE_THRESHOLD
        });

    private async loadLibrary() {
        this.faceapi = await import(
            /* webpackChunkName: "face-api" */
            /* webpackPreload: true */
            'face-api.js'
        );

        this.loadedFaceApi = true;
    }

    private async loadModel() {
        await Promise.all([
            this.faceapi!.loadTinyFaceDetectorModel(FaceDetector.MODEL_LOCATION),
            this.faceapi!.loadFaceLandmarkModel(FaceDetector.MODEL_LOCATION),
        ]);

        this.loadedFaceApiModel = true;
    }

    public async init() {
        await this.loadLibrary();
        await this.loadModel();
    }

    public async findFaceLandmarks(source: Source) {
        const canvasImageSource = source.getProcessableSource();
        const face = this.faceapi!.detectSingleFace(canvasImageSource, this.options);
        const faceLandmarks = await face.withFaceLandmarks();
        if(!faceLandmarks)
            return null;

        return faceLandmarks;
    }

    public drawDebugOverlay(
        canvas: HTMLCanvasElement,
        faceLandmarkResult: FaceLandmarksResult
    ) {
        const {
            landmarks: faceLandmarks
        } = faceLandmarkResult;

        const drawLandmarksOptions = {
            lineWidth: 2,
            drawLines: true,
            color: 'green'
        };

        this.faceapi!.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
    }
}
