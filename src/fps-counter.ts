export default class FPSCounter {
    private static readonly ELEMENT_ID = '#fps';

    private lastUpdate: number = 0;

    public update() {
        const now = window.performance.now();
        const interval = now - this.lastUpdate;
        this.lastUpdate = now;

        const fps = Math.round(1000 / interval);

        const fpsElement =
            document.querySelector(FPSCounter.ELEMENT_ID);
        if(!fpsElement)
            return;

        fpsElement.textContent = `${fps} fps`;
    }
}
