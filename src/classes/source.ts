import { TNetInput } from 'face-api.js';

import Dimensions from './dimensions';

type RawSource = CanvasImageSource & TNetInput;

export default abstract class Source {
    public abstract getRawSource(): RawSource;
    public abstract getDimensions(): Dimensions;
}
