import { LitElement, customElement, property } from 'lit-element';

import { htmlify, cssify } from '@utils/resultify';

import FaceDetector from '@classes/face-detector';
import SourceController, { SourceType } from '@classes/source-controller';
import EffectController, { EffectType } from '@classes/effect-controller';
import Source from '@classes/source';
import OverlayEffect from '@classes/overlay-effect';

import '@components/viewer';
import '@components/dialog';
import '@components/shutter';

import template from './template.html';
import style from './style.scss';

@customElement('phold-app')
export default class App extends LitElement {
    @property({ type: Object })
    private currentSource: Source;

    @property({ type: Object })
    private currentEffect: OverlayEffect;

    private faceDetector: FaceDetector = new FaceDetector();
    private loadedFaceDetector: boolean = false;

    private sourceController: SourceController = new SourceController();
    private effectController: EffectController = new EffectController();

    private showingErrorMessage: boolean = false;
    private errorMessage: string = '';

    private runningViewer: boolean = false;

    constructor() {
        super();

        this.currentSource = this.sourceController.getCurrent();
        this.currentEffect = this.effectController.getCurrent();
        this.initFaceDetector();
    }

    private async initFaceDetector() {
        try {
            await this.faceDetector.init();
            this.loadedFaceDetector = true;

            this.effectController
                .initFaceFlapsOverlayEffect(this.faceDetector);
        } catch(err) {
            const unavailableErr = new Error(`Unable to load face detector. It's needed for the visual. Please try reloading.`);
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

    private async switchToCamera() {
        try {
            this.currentSource =
                await this.sourceController.switchTo(SourceType.CAMERA);

            this.currentEffect =
                this.effectController.switchTo(EffectType.NONE);
        } catch(err) {
            this.showErrorDialog(err);
        }

        this.runningViewer = true;
    }

    private onPressShutter() {
        this.switchToCameraFrame();
    }

    private async switchToCameraFrame() {
        try {
            this.currentEffect =
                this.effectController.switchTo(EffectType.FLAPS);

            this.currentSource =
                await this.sourceController.switchTo(SourceType.CAMERA_FRAME);
        } catch(err) {
            this.showErrorDialog(err);
        }
    }

    public render() {
        return htmlify(template, {
            // Dialog
            showingErrorMessage: this.showingErrorMessage,
            errorMessage: this.errorMessage,
            onDialogClose: this.closeErrorDialog.bind(this),

            // Viewer
            runningViewer: this.runningViewer,
            currentSource: this.currentSource,
            currentEffect: this.currentEffect,
            onViewerReady: this.onViewerReady.bind(this),

            // Shutter
            onPressShutter: this.onPressShutter.bind(this)
        });
    }

    public static get styles() {
        return cssify(style);
    }
}
