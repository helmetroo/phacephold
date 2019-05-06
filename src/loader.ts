require('./styles/loader');

export default class Loader {
    private static readonly ELEMENT_ID = '#loader';
    private loaderElement: Element | null = null;

    constructor() {
        this.loaderElement =
            document.querySelector(Loader.ELEMENT_ID);
    }

    hide() {
        this.loaderElement!.remove();
    }
}
