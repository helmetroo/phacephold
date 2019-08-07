import Source from './source';
import Dimensions from './dimensions';

export default class ImageSource extends Source {
    private imageElement: HTMLImageElement;

    constructor(src: string) {
        super();

        this.imageElement = new Image();
        this.imageElement.src = src;
    }

    public async waitUntilLoaded() {
        await new Promise((resolve, reject) => {
            this.imageElement.onload = resolve;
            this.imageElement.onerror = reject;
        });
    }

    public getRawSource() {
        return this.imageElement;
    }

    public getDimensions() {
        const dimensions: Dimensions = {
            width: this.imageElement.width,
            height: this.imageElement.height
        };

        return dimensions;
    }

    public destroy() {
        this.imageElement.remove();
    }
}
