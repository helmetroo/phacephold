// Stylesheets
import '@global-styles';

// Components necessary to start
import '@components/loader';

const body = document.body;
const loader = document.createElement('phold-loader');
body.appendChild(loader);

import(
    /* webpackChunkName: "app" */
    '@components/app'
).then(() => {
    console.log('Loaded app');
    const appElement = document.createElement('phold-app');
    body.appendChild(appElement);

    loader.setAttribute('hidden', '');
});
