import { LitElement, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { htmlify, cssify } from '@utils/resultify';

import FaceDetector from '@classes/face-detector';
import SourceController from '@classes/source-controller';
import EffectController from '@classes/effect-controller';
import Source from '@classes/source';
import ImageSource from '@classes/image-source';
import BlankSource from '@classes/blank-source';
import OverlayEffect from '@classes/overlay-effect';
import ImageEvent from '@classes/image-event';

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
    private choosePhotoActive: boolean = true;

    @property({ type: Boolean })
    private renderViewerOnce: boolean = false;

    private mode: AppMode = AppMode.CAMERA;

    private faceDetector: FaceDetector = new FaceDetector();
    private loadedFaceDetector: boolean = false;

    private sourceController: SourceController = new SourceController();
    private effectController: EffectController = new EffectController();

    constructor() {
        super();

        this.currentSource = this.sourceController.getNoop();
        this.currentEffect = this.effectController.getNoop();

        this.handleResizeEvents();

        this.initFaceDetector();
    }

    private handleResizeEvents() {
        window.onresize = this.onResize.bind(this);
        window.onorientationchange = this.onResize.bind(this);
    }

    private async onResize() {
        await this.sourceController.reloadCamera();
        if(this.mode === AppMode.CAMERA)
            await this.switchToCamera();
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

    private async onViewerReady() {
        try {
            await this.switchToCamera();
        } catch(err) {
            this.showErrorDialog(err);
        }

        this.viewerActive = true;
    }

    private onViewerRender(event: ImageEvent) {
        this.lastRender = event.detail;
        this.lastRenderSet = true;
    }

    private onPressShutter() {
        this.pauseCamera();
        this.disableChoosePhotoButton();

        try {
            this.switchToCameraFrame();
        } catch(err) {
            this.showErrorDialog(err);
            this.enableChoosePhotoButton();
            this.switchToCamera();
        }
    }

    private pauseCamera() {
        this.sourceController.pauseCamera();
    }

    private onUploadLocalImage(event: ImageEvent) {
        this.pauseCamera();
        this.disableChoosePhotoButton();

        try {
            const localImage = event.detail;
            this.switchToLocalImage(localImage);
        } catch(err) {
            this.showErrorDialog(err);
            this.enableChoosePhotoButton();
        }
    }

    private onPressAcceptPhoto() {
        this.enableChoosePhotoButton();
        this.switchToCamera();
    }

    private onPressRejectPhoto() {
        this.enableChoosePhotoButton();
        this.switchToCamera();
    }

    private async switchToCameraFrame() {
        const cameraFrame =
            await this.sourceController.captureCameraFrame();
        await this.createImageFrom(cameraFrame);
        this.mode = AppMode.CAMERA_FRAME;
    }

    private async switchToCamera() {
        const camera =
            await this.sourceController.getCamera();

        const noopEffect =
            this.effectController.getNoop();

        this.currentSource = camera;
        this.currentEffect = noopEffect;
        this.renderViewerOnce = false;

        this.mode = AppMode.CAMERA;
        this.lastRender = new BlankSource();
        this.lastRenderSet = false;
    }

    private async switchToLocalImage(localImage: ImageSource) {
        await this.sourceController.loadLocalImage(localImage);
        await this.createImageFrom(localImage);
        this.mode = AppMode.LOCAL_IMAGE;
    }

    private async createImageFrom(image: ImageSource) {
        // To speed up, try rendering a smaller version of the video into a new canvas,
        // pass said canvas into this call.
        const faceLandmarkResult =
            await this.faceDetector.findFaceLandmarks(image);

        if(!faceLandmarkResult) {
            // Show error message that goes away within a few seconds
            const noFaceErr = new Error('No faces detected. Try again with another shot or image.');
            throw noFaceErr;
        }

        const faceLandmarks = faceLandmarkResult.landmarks;
        const faceFlapsEffect =
            this.effectController.getFaceFlaps(faceLandmarks);

        this.currentSource = image;
        this.currentEffect = faceFlapsEffect;
        this.renderViewerOnce = true;
    }

    private disableChoosePhotoButton() {
        this.choosePhotoActive = false;
    }

    private enableChoosePhotoButton() {
        this.choosePhotoActive = true;
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
            choosePhotoActive: this.choosePhotoActive,
            onUploadLocalImage: this.onUploadLocalImage.bind(this),

            // Shutter
            onPressShutter: this.onPressShutter.bind(this)
        });
    }

    public static get styles() {
        return cssify(style);
    }
}
