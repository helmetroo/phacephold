// Stylesheets
require('normalize.css/normalize');
require('./styles/index');

import App from './app';

if('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            await navigator.serviceWorker.register('/service-worker.js');
            console.log('Registered worker!');
        } catch(err) {
            console.error(err);
        }
    });
}

const app = new App();
app.init();
