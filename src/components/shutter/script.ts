import { LitElement, customElement, property, html } from 'lit-element';

import { htmlify, cssify } from '@utils/resultify';

import template from './template.html';
import style from './style.scss';

@customElement('phold-shutter')
export default class Shutter extends LitElement {
    public render() {
        return htmlify(template, {
            emitShutterEvent: this.emitShutterEvent
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private emitShutterEvent() {
        const shutterEvent = new CustomEvent('shutter.press');
        this.dispatchEvent(shutterEvent);
    }
}
