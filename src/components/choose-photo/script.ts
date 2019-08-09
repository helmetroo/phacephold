import { LitElement, customElement, property, html } from 'lit-element';

import { htmlify, cssify, svgify } from '@utils/resultify';

import template from './template.html';
import icon from './icon.svg';
import style from './style.scss';

@customElement('phold-choose-photo')
export default class ChoosePhoto extends LitElement {
    public render() {
        return htmlify(template, {
            emitChoosePhotoEvent: this.emitChoosePhotoEvent,
            icon: svgify(icon)
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private emitChoosePhotoEvent() {
        const choosePhotoEvent = new CustomEvent('choose-photo.press');
        this.dispatchEvent(choosePhotoEvent);
    }
}
