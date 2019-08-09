import { LitElement, customElement, property } from 'lit-element';

import FaceDetector from '@classes/face-detector';
import RenderPipeline from '@classes/render-pipeline';
import Source from '@classes/source';
import BlankSource from '@classes/blank-source';
import OverlayEffect from '@classes/overlay-effect';
import NoopOverlayEffect from '@classes/noop-overlay-effect';

import { htmlify, cssify } from '@utils/resultify';

import template from './template.html';
import style from './style.scss';
import ImageSource from '@classes/image-source';

@customElement('phold-viewer')
export default class Viewer extends LitElement {
    @property({ type: Object })
    public source: Source = new BlankSource();

    @property({ type: Object })
    public effect: OverlayEffect = new NoopOverlayEffect();

    @property({ type: Boolean })
    public active: boolean = false;

    @property({ type: Boolean })
    public renderOnce: boolean = false;

    private ready: boolean = false;

    private renderPipeline: RenderPipeline = new RenderPipeline();

    public firstUpdated() {
        const canvasRoot =
            this.shadowRoot!.getElementById('canvas-container')!;
        this.renderPipeline.mount(canvasRoot);

        this.ready = true;
        this.emitReadyEvent();
    }

    private emitReadyEvent() {
        const readyEvent = new CustomEvent('viewer.ready');
        this.dispatchEvent(readyEvent);
    }

    private emitRenderEvent(renderImage: ImageSource) {
        const renderEvent = new CustomEvent('viewer.render', {
            detail: renderImage
        });

        this.dispatchEvent(renderEvent);
    }

    public beginTick() {
        const tick = this.tick.bind(this);
        requestAnimationFrame(tick);
    }

    private tick() {
        if(!this.active)
            return;

        this.draw();

        if(this.renderOnce) {
            const renderFrame =
                this.renderPipeline.getFrameFromRenderCanvas();
            this.emitRenderEvent(renderFrame);
            return;
        }

        const tick = this.tick.bind(this);
        requestAnimationFrame(tick);
    }

    private draw() {
        this.renderPipeline.render();
    }

    public updated() {
        this.renderPipeline.setSource(this.source);
        this.renderPipeline.setEffect(this.effect);

        const startTicking = this.active && !this.renderOnce;
        if(startTicking)
            this.beginTick();
    }

    public render() {
        return htmlify(template);
    }

    public static get styles() {
        return cssify(style);
    }
}
