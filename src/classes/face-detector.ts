import {
    FaceLandmarks68,
    WithFaceLandmarks,
    FaceDetection,
    TinyFaceDetectorOptions,
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

    private faceApi: typeof import('face-api.js') | null = null;
    private loadedFaceApi: boolean = false;

    private loadedFaceApiModel: boolean = false;

    private options: TinyFaceDetectorOptions
        = new TinyFaceDetectorOptions({
            inputSize: FaceDetector.DEFAULT_INPUT_SIZE,
            scoreThreshold: FaceDetector.DEFAULT_SCORE_THRESHOLD
        });

    private async loadFaceApi() {
        this.faceApi = await import(
            /* webpackChunkName: "face-api" */
            'face-api.js'
        );

        this.loadedFaceApi = true;
    }

    private async loadModel() {
        if(!this.faceApi)
            return;

        await Promise.all([
            this.faceApi.loadTinyFaceDetectorModel(FaceDetector.MODEL_LOCATION),
            this.faceApi.loadFaceLandmarkModel(FaceDetector.MODEL_LOCATION),
        ]);

        this.loadedFaceApiModel = true;
    }

    public async init() {
        await this.loadFaceApi();
        await this.loadModel();
    }

    public async findFaceLandmarks(source: Source) {
        if(!this.faceApi)
            return null;

        const canvasImageSource = source.getRawSource();
        const face = this.faceApi.detectSingleFace(canvasImageSource, this.options);
        const faceLandmarks = await face.withFaceLandmarks();
        if(!faceLandmarks)
            return null;

        return faceLandmarks;
    }

    public drawDebugOverlay(
        canvas: HTMLCanvasElement,
        faceLandmarkResult: FaceLandmarksResult
    ) {
        if(!this.faceApi)
            return;

        const {
            landmarks: faceLandmarks
        } = faceLandmarkResult;

        const drawLandmarksOptions = {
            lineWidth: 2,
            drawLines: true,
            color: 'green'
        };

        this.faceApi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
    }
}
