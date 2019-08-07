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

@customElement('phold-viewer')
export default class Viewer extends LitElement {
    @property({ type: Object })
    public source: Source = new BlankSource();

    @property({ type: Object })
    public effect: OverlayEffect = new NoopOverlayEffect();

    @property({ type: Boolean })
    public running: boolean = false;

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

    public beginTick() {
        const tick = this.tick.bind(this);
        requestAnimationFrame(tick);
    }

    private tick() {
        if(!this.running)
            return;

        this.draw();

        const tick = this.tick.bind(this);
        requestAnimationFrame(tick);
    }

    private draw() {
        this.renderPipeline.render();
    }

    public updated() {
        this.renderPipeline.setSource(this.source);
        this.renderPipeline.setEffect(this.effect);

        if(this.running)
            this.beginTick();
    }

    public render() {
        return htmlify(template);
    }

    public static get styles() {
        return cssify(style);
    }
}
