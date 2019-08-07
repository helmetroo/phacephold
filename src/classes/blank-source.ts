import ImageSource from './image-source';

import BLANK_IMAGE_URL from '@assets/blank.png';

export default class BlankSource extends ImageSource {
    constructor() {
        super(BLANK_IMAGE_URL);
    }
}
