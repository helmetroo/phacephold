import ImageSource from './image-source';

export default interface RenderEvent extends CustomEvent<ImageSource> {
    detail: ImageSource
}
