import { LitElement, customElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';

import { htmlify, cssify } from '@utils/resultify';

import template from './template.html';
import style from './style.scss';

@customElement('phold-dialog')
export default class Dialog extends LitElement {
    @property({ type: String })
    message = '';

    @property({ type: Boolean })
    active = false;

    public render() {
        const templateArgs = {
            classes: classMap({
                dialog: true,
                active: this.active,
                inactive: !this.active
            }),
            message: this.message,
            onConfirm: this.onClose.bind(this)
        };

        return htmlify(template, templateArgs);
    }

    private onClose() {
        this.active = false;
    }

    public static get styles() {
        return cssify(style);
    }
}
