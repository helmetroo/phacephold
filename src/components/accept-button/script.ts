import { LitElement, customElement, property, html } from 'lit-element';

import ImageSource from '@classes/image-source';
import BlankSource from '@classes/blank-source';

import { htmlify, cssify, svgify } from '@utils/resultify';

import template from './template.html';
import icon from './icon.svg';
import style from './style.scss';

@customElement('phold-accept-button')
export default class AcceptPhotoButton extends LitElement {
    @property({ type: Object })
    public image: ImageSource = new BlankSource();

    public render() {
        return htmlify(template, {
            onPressAcceptButton: this.onPressAcceptButton,
            downloadImage: this.downloadImage,
            icon: svgify(icon)
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private onPressAcceptButton() {
        this.downloadImage();
        this.emitPressAcceptButtonEvent();
    }

    private downloadImage() {
        const imageUrl = this.image.getUrl();
        const anchorElement = <HTMLAnchorElement> this.shadowRoot!.firstElementChild!;
        anchorElement.href = imageUrl;
    }

    private emitPressAcceptButtonEvent() {
        const acceptButtonEvent = new CustomEvent('accept-button.press');
        this.dispatchEvent(acceptButtonEvent);
    }
}
