const runServiceWorker = () => {
    if('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                await navigator.serviceWorker.register('/service-worker.js');
            } catch(err) {
                console.error(err);
            }
        });
    }
}

export default runServiceWorker;
