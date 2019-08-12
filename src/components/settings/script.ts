import { LitElement, customElement, property, html } from 'lit-element';

import { htmlify, cssify, svgify } from '@utils/resultify';

import template from './template.html';
import icon from './icon.svg';
import style from './style.scss';

@customElement('phold-settings')
export default class Settings extends LitElement {
    public render() {
        return htmlify(template, {
            emitSettingsEvent: this.emitSettingsEvent,
            icon: svgify(icon)
        });
    }

    public static get styles() {
        return cssify(style);
    }

    private emitSettingsEvent() {
        const settingsEvent = new CustomEvent('settings.press');
        this.dispatchEvent(settingsEvent);
    }
}
