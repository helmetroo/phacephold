import { LitElement, customElement, property } from 'lit-element';

import { htmlify, cssify } from '@utils/resultify';

import template from './template.html';
import style from './style.scss';

@customElement('phold-loader')
export default class Loader extends LitElement {
    @property({ type: Boolean })
    public hidden: boolean = false;

    public render() {
        return htmlify(template);
    }

    public static get styles() {
        return cssify(style);
    }

    public updated() {
        if(this.hidden)
            this.stageForRemoval();
    }

    private stageForRemoval() {
        setTimeout(() => this.remove(), 1000);
    }
}
