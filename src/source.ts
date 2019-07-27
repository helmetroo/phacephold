import { TNetInput } from 'face-api.js';

import Dimensions from './dimensions';

type ProcessableSource = CanvasImageSource & TNetInput;

export default abstract class Source {
    public abstract getProcessableSource(): ProcessableSource;
    public abstract getDimensions(): Dimensions;
}
