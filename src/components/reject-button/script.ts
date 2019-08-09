import { LitElement, customElement, property, html } from 'lit-element';

import { htmlify, cssify, svgify } from '@utils/resultify';

import template from './template.html';
import icon from './icon.svg';
import style from './style.scss';

@customElement('phold-reject-button')
export default class RejectPhotoButton extends LitElement {
    public render() {
        return htmlify(template, {
            emitRejectButtonEvent: this.emitRejectButtonEvent,
            icon: svgify(icon)
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private emitRejectButtonEvent() {
        const rejectButtonEvent = new CustomEvent('reject-button.press');
        this.dispatchEvent(rejectButtonEvent);
    }
}
