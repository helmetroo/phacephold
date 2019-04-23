import * as faceapi from 'face-api.js';

export enum MessageType {
    INIT = 'init',
    ERROR = 'error',
    FRAME = 'frame',
    DETECT_FACES = 'detect-faces',
    LOG = 'log'
};

export type FaceLandmarks = 
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68> | undefined;

export interface IMessage {
    type: MessageType
    logArgs: Array<any>, // only LOG
    videoElementId: string, // only FRAME
    faces: FaceLandmarks // only DETECT_FACES
};
