import { LitElement, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { htmlify, cssify } from '@utils/resultify';

import FaceDetector from '@classes/face-detector';
import SourceController, { SourceType } from '@classes/source-controller';
import EffectController from '@classes/effect-controller';
import Source from '@classes/source';
import ImageSource from '@classes/image-source';
import BlankSource from '@classes/blank-source';
import OverlayEffect from '@classes/overlay-effect';
import RenderEvent from '@classes/render-event';

import CancellationError from '@errors/cancellation-error';

import '@components/viewer';
import '@components/dialog';
import '@components/choose-photo';
import '@components/shutter';
import '@components/settings';
import '@components/accept-button';
import '@components/reject-button';

import template from './template.html';
import style from './style.scss';

enum AppMode {
    CAMERA,
    CAMERA_FRAME,
    LOCAL_IMAGE,
}

type ImageMode = AppMode.CAMERA_FRAME | AppMode.LOCAL_IMAGE;

const IMAGE_MODE_TO_SOURCE_TYPE = {
    [AppMode.CAMERA_FRAME]: SourceType.CAMERA_FRAME,
    [AppMode.LOCAL_IMAGE]: SourceType.LOCAL_IMAGE
}

@customElement('phold-app')
export default class App extends LitElement {
    @property({ type: Object })
    private currentSource: Source;

    @property({ type: Object })
    private currentEffect: OverlayEffect;

    @property({ type: Boolean })
    private lastRenderSet: boolean = false;
    private lastRender: ImageSource = new BlankSource();

    @property({ type: Boolean })
    private showingErrorMessage: boolean = false;
    private errorMessage: string = '';

    @property({ type: Boolean })
    private viewerActive: boolean = false;

    @property({ type: Boolean })
    private renderViewerOnce: boolean = false;

    private mode: AppMode = AppMode.CAMERA;

    private faceDetector: FaceDetector = new FaceDetector();
    private loadedFaceDetector: boolean = false;

    private sourceController: SourceController = new SourceController();
    private effectController: EffectController = new EffectController();

    constructor() {
        super();

        this.currentSource = this.sourceController.getCurrent();
        this.currentEffect = this.effectController.getNoop();
        this.initFaceDetector();
    }

    private async initFaceDetector() {
        try {
            await this.faceDetector.init();
            this.loadedFaceDetector = true;
        } catch(err) {
            const unavailableErr =
                new Error(`Unable to load face detector. It's needed for the visual. Please try reloading.`);
            this.showErrorDialog(unavailableErr);
        }
    }

    private showErrorDialog(err: Error) {
        this.showingErrorMessage = true;
        this.errorMessage = err.message;
    }

    private closeErrorDialog() {
        this.showingErrorMessage = false;
        this.errorMessage = '';
    }

    private onViewerReady() {
        this.switchToCamera();
    }

    private onViewerRender(event: RenderEvent) {
        this.lastRender = event.detail;
        this.lastRenderSet = true;
    }

    private onPressShutter() {
        this.switchToImageMode(AppMode.CAMERA_FRAME);
    }

    private onPressChoosePhoto() {
        this.switchToImageMode(AppMode.LOCAL_IMAGE);
    }

    private onPressAcceptPhoto() {
        this.switchToCamera();
    }

    private onPressRejectPhoto() {
        this.switchToCamera();
    }

    private async switchToCamera() {
        try {
            const camera =
                await this.sourceController.switchTo(SourceType.CAMERA);

            const noopEffect =
                this.effectController.getNoop();

            this.currentSource = camera;
            this.currentEffect = noopEffect;
            this.renderViewerOnce = false;

            this.mode = AppMode.CAMERA;
            this.lastRender = new BlankSource();
            this.lastRenderSet = false;
        } catch(err) {
            this.showErrorDialog(err);
        }

        this.viewerActive = true;
    }

    private async switchToImageMode(imageMode: ImageMode) {
        try {
            // Switch handlers called prematurely. Should actually do the switch when we say this.currentSource = cameraFrame
            const sourceMode = IMAGE_MODE_TO_SOURCE_TYPE[imageMode];
            const imageSource =
                await this.sourceController.switchTo(sourceMode);

            // To speed up, try rendering a smaller version of the video into a new canvas,
            // pass said canvas into this call.
            const faceLandmarkResult =
                await this.faceDetector.findFaceLandmarks(imageSource);

            if(!faceLandmarkResult) {
                // Show error message that goes away within a few seconds
                const noFaceErr = new Error('No faces detected. Try recomposing your shot.');
                throw noFaceErr;
            }

            const faceLandmarks = faceLandmarkResult.landmarks;
            const faceFlapsEffect =
                this.effectController.getFaceFlaps(faceLandmarks);

            this.currentSource = imageSource;
            this.currentEffect = faceFlapsEffect;
            this.renderViewerOnce = true;

            this.mode = imageMode;
        } catch(err) {
            const isNotCancellationErr = !(err instanceof CancellationError);
            if(isNotCancellationErr)
                this.showErrorDialog(err);

            this.switchToCamera();
        }
    }

    public render() {
        const viewerButtonRowClasses = classMap({
            'accept-reject-row': true,
            'hidden': !this.lastRenderSet
        });

        return htmlify(template, {
            // Dialog
            showingErrorMessage: this.showingErrorMessage,
            errorMessage: this.errorMessage,
            onDialogClose: this.closeErrorDialog.bind(this),

            // Viewer
            viewerActive: this.viewerActive,
            renderViewerOnce: this.renderViewerOnce,
            lastRender: this.lastRender,
            currentSource: this.currentSource,
            currentEffect: this.currentEffect,
            onViewerReady: this.onViewerReady.bind(this),
            onViewerRender: this.onViewerRender.bind(this),
            viewerBtnRowClasses: viewerButtonRowClasses,
            onPressAcceptPhoto: this.onPressAcceptPhoto.bind(this),
            onPressRejectPhoto: this.onPressRejectPhoto.bind(this),

            // Choose photo
            onPressChoosePhoto: this.onPressChoosePhoto.bind(this),

            // Shutter
            onPressShutter: this.onPressShutter.bind(this)
        });
    }

    public static get styles() {
        return cssify(style);
    }
}
