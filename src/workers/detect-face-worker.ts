import * as faceapi from 'face-api.js';

import { MessageType, IMessage } from './detect-face-worker-message';

const ctx: Worker = self as any;

class DetectFaceWorker {
    private loaded: boolean = false;
    private options: faceapi.TinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 512, 
        scoreThreshold: 0.5 
    });

    private async loadModel() {
        return faceapi.loadTinyFaceDetectorModel('/data');
    }

    public async init() {
        try {
            await this.loadModel();
            console.log(faceapi);
        } catch(err) {
            ctx.postMessage({
                type: MessageType.ERROR
            });
        }

        this.loaded = true;
        ctx.postMessage({
            type: MessageType.INIT
        });

        ctx.addEventListener('message', async (event: MessageEvent) => {
            const message: IMessage = event.data;
            switch(message.type) {
                case MessageType.FRAME:
                    this.processFrameMessage(message);
                    break;
            }
        });
    }

    private async processFrameMessage(message: IMessage) {
        const faces = await this.detectFaces(message.videoElementId);
        console.log(faces);
        ctx.postMessage({ 
            type: MessageType.DETECT_FACES, 
            faces: faces 
        });
    }

    private detectFaces(videoElementId: string) {       
        return faceapi.detectSingleFace(videoElementId, this.options)
            .withFaceLandmarks();
    }

    private log() {
        ctx.postMessage({ 
            type: MessageType.LOG,
            args: Array.from(arguments) 
        });
    }
}

const detectFaceWorker = new DetectFaceWorker();
detectFaceWorker.init();

// Necessary to allow the import of the worker under a name
export default {} as typeof Worker & {new (): Worker};
