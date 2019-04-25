export default class FPSCounter {
    private static readonly ELEMENT_ID = '#fps';
    private fpsElement: Element | null = null;

    private lastUpdate: number = 0;

    constructor() {
        this.fpsElement =
            document.querySelector(FPSCounter.ELEMENT_ID);
    }

    public update() {
        if(!this.fpsElement)
            return;

        const now = window.performance.now();
        const interval = now - this.lastUpdate;
        this.lastUpdate = now;

        const fps = Math.round(1000 / interval);
        this.fpsElement.textContent = `${fps} fps`;
    }
}
