import * as faceapi from 'face-api.js';

export type FaceLandmarks =
    faceapi.FaceLandmarks68;

// Inferred from emacs typescript-mode
export type FaceLandmarksResult =
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, FaceLandmarks>;

export default class FaceDetector {
    private static readonly MODEL_LOCATION: string = '/data';
    private static readonly DEFAULT_INPUT_SIZE: number = 512;
    private static readonly DEFAULT_SCORE_THRESHOLD: number = 0.5;

    private loaded: boolean = false;
    private options: faceapi.TinyFaceDetectorOptions
        = new faceapi.TinyFaceDetectorOptions({
            inputSize: FaceDetector.DEFAULT_INPUT_SIZE,
            scoreThreshold: FaceDetector.DEFAULT_SCORE_THRESHOLD
        });

    private async loadModel() {
        return Promise.all([
            faceapi.loadTinyFaceDetectorModel(FaceDetector.MODEL_LOCATION),
            faceapi.loadFaceLandmarkModel(FaceDetector.MODEL_LOCATION),
        ]);
    }

    public async init() {
        try {
            await this.loadModel();
        } catch(err) {
            // Flag error
        }

        this.loaded = true;
    }

    public async findFaceLandmarks(videoElement: HTMLVideoElement) {
        const face = faceapi.detectSingleFace(videoElement, this.options);
        const faceLandmarks = await face.withFaceLandmarks();
        if(!faceLandmarks)
            return null;

        return faceLandmarks;
    }

    public drawDebugOverlay(
        videoElement: HTMLVideoElement,
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

        faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
    }
}
