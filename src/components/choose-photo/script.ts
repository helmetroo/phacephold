import { LitElement, customElement, property } from 'lit-element';

import ImageSource from '@classes/image-source';

import { htmlify, cssify, svgify } from '@utils/resultify';

import template from './template.html';
import icon from './icon.svg';
import style from './style.scss';
import { classMap } from 'lit-html/directives/class-map';

@customElement('phold-choose-photo')
export default class ChoosePhoto extends LitElement {
    @property({ type: Boolean })
    public active: boolean = true;

    public render() {
        const classes = classMap({
            'choose-photo-button': true,
            disabled: !this.active
        });

        return htmlify(template, {
            classes,
            emitChoosePhotoEvent: this.emitChoosePhotoEvent,
            icon: svgify(icon)
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private emitChoosePhotoEvent(event: Event) {
        if(!this.active)
            return;

        const target = <HTMLInputElement> event.target;
        const file = target.files && target.files[0];
        if(!file)
            return;

        const imageUrl = URL.createObjectURL(file);
        const image = new ImageSource(imageUrl);
        const choosePhotoEvent = new CustomEvent('choose-photo.upload', {
            detail: image
        });

        this.dispatchEvent(choosePhotoEvent);
    }
}
