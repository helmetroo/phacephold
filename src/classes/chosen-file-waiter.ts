import { EventEmitter } from 'events';

import ImageSource from './image-source';
import CancellationError from './errors/cancellation-error';

type Resolver = typeof Promise.resolve;
type Rejecter = typeof Promise.reject;

export default class ChosenFileWaiter extends EventEmitter {
    private static readonly CHOOSE_EVENT = 'file-waiter.choose';
    private static readonly CANCEL_EVENT = 'file-waiter.cancel';

    constructor(
        private readonly fileInput: HTMLInputElement
    ) {
        super();
        document.body.onfocus = this.onExitFileDialog.bind(this);
    }

    public async waitForChosenImage() {
        return new Promise<ImageSource>((resolve, reject) => {
            this.once(ChosenFileWaiter.CHOOSE_EVENT, this.onChooseImage(resolve));
            this.once(ChosenFileWaiter.CANCEL_EVENT, this.onCancel(reject));
        });
    }

    private onExitFileDialog() {
        setTimeout(() => {
            const noFiles = (this.fileInput.value.length === 0);
            if(noFiles) {
                this.emit(ChosenFileWaiter.CANCEL_EVENT);
                return;
            }

            const choice =
                (this.fileInput.files && this.fileInput.files[0])!;

            const imageUrl = URL.createObjectURL(choice);
            const image = new ImageSource(imageUrl);
            this.emit(ChosenFileWaiter.CHOOSE_EVENT, image);
        }, 500);
    }

    private onChooseImage(resolve: Resolver) {
        return (image: ImageSource) => {
            this.restoreOnFocus();
            return resolve(image);
        }
    }

    private onCancel(reject: Rejector) {
        return () => {
            this.restoreOnFocus();
            return reject(new CancellationError('No image chosen.'));
        };
    }

    private restoreOnFocus() {
        document.body.onfocus = null;
    }
}
