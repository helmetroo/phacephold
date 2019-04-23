import * as faceapi from 'face-api.js';

// Inferred from emacs typescript-mode
export type FaceLandmarksResult =
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>;

export type FaceLandmarks =
    faceapi.FaceLandmarks68;

export interface Dimensions {
    width: number,
    height: number
};

export type IDimensions =
    HTMLVideoElement | Dimensions;

export default class FaceDetector {
    private loaded: boolean = false;
    private options: faceapi.TinyFaceDetectorOptions
        = new faceapi.TinyFaceDetectorOptions();

    constructor(options?: faceapi.TinyFaceDetectorOptions) {
        if(!options) {
            options = <faceapi.TinyFaceDetectorOptions>{
                inputSize: 512,
                scoreThreshold: 0.5
            };
        }

        this.options = new faceapi.TinyFaceDetectorOptions(options);
    }

    private async loadModel() {
        return Promise.all([
            faceapi.loadTinyFaceDetectorModel('/data'),
            faceapi.loadFaceLandmarkModel('/data'),
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

    private static resizeCanvasAndResults(
        dimensions: IDimensions,
        canvas: HTMLCanvasElement,
        landmarks: FaceLandmarks
    ) {
        const { width, height } = (dimensions instanceof HTMLVideoElement)
            ? faceapi.getMediaDimensions(dimensions)
            : dimensions
        canvas.width = width
        canvas.height = height

        // resize detections (and landmarks) in case
        // displayed image is smaller than original size
        return landmarks.forSize(width, height);
    }

    public drawDebugOverlay(
        dimensions: IDimensions,
        canvas: HTMLCanvasElement,
        faceLandmarkResult: FaceLandmarksResult
    ) {
        const {
            landmarks: faceLandmarks
        } = faceLandmarkResult;

        const resizedFaceLandmarks =
            FaceDetector.resizeCanvasAndResults(dimensions, canvas, faceLandmarks);

        const drawLandmarksOptions = {
            lineWidth: 2,
            drawLines: true,
            color: 'green'
        };

        faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
    }
}
