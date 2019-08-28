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
        this.openOrDownloadImage();
        this.emitPressAcceptButtonEvent();
    }

    private openOrDownloadImage() {
        // Download supposedly supported on iOS 13
        const iosMajorVersion = AcceptPhotoButton.getIosMajorVersion();
        const openImage = (iosMajorVersion !== false) && (iosMajorVersion <= 12);
        (openImage)
            ? this.openImage()
            : this.downloadImage();
    }

    private openImage() {
        const imageDataUrl = this.image.getUrl();
        window.open(imageDataUrl);
    }

    private downloadImage() {
        const imageDataUrl = this.image.getUrl();
        const imageBlobUrl = AcceptPhotoButton.dataURIToObjectURI(imageDataUrl);

        const anchorElement = <HTMLAnchorElement> this.shadowRoot!.firstElementChild!;
        anchorElement.href = imageBlobUrl;

        requestAnimationFrame(() => {
            URL.revokeObjectURL(imageBlobUrl);
            anchorElement.removeAttribute('href');
        });
    }

    // from https://stackoverflow.com/a/14223920
    private static getIosMajorVersion() {
        if(/iP(hone|od|ad)/.test(navigator.platform)) {
            const version = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            if(!version)
                return false;

            return parseInt(version[1], 10);
        }

        return false;
    }

    // from https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill,
    // and https://stackoverflow.com/a/37151835
    private static dataURIToBlob(dataURI: string) {
        const binaryString = atob(dataURI.split(',')[1]);
        const stringLength = binaryString.length;
        const binaryArray = new Uint8Array(stringLength);

        for(let i = 0; i < stringLength; i++) {
            binaryArray[i] = binaryString.charCodeAt(i);
        }

        return new Blob([binaryArray]);
    }

    private static dataURIToObjectURI(dataURI: string) {
        const blob = this.dataURIToBlob(dataURI);
        return URL.createObjectURL(blob);
    }

    private emitPressAcceptButtonEvent() {
        const acceptButtonEvent = new CustomEvent('accept-button.press');
        this.dispatchEvent(acceptButtonEvent);
    }
}
