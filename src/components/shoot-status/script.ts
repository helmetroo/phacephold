import { LitElement, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { htmlify, cssify } from '@utils/resultify';

import template from './template.html';
import style from './style.scss';

@customElement('phold-shoot-status')
export default class ShootStatus extends LitElement {
    @property({ type: Boolean })
    public canSeeFace: boolean = false;

    public render() {
        const statusMessage = this.canSeeFace ? 'READY' : 'WAITING';
        const circleClasses = classMap({
            circle: true,
            'face-visible': this.canSeeFace,
            'no-face-visible': !this.canSeeFace
        });

        return htmlify(template, {
            statusMessage,
            circleClasses
        });
    }

    public static get styles() {
        return cssify(style);
    }
}
