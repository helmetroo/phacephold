// Stylesheets
import '@global-styles';

type AsyncAction = () => Promise<void>;
interface WebComponents {
    waitFor: (cb: AsyncAction) => void
};

interface WindowWithWebComponents extends Window {
    WebComponents: WebComponents
}

const onLoadWebComponents = (action: AsyncAction) => {
    const windowWithWC = <WindowWithWebComponents> window;
    windowWithWC.WebComponents = windowWithWC.WebComponents || {
        waitFor(cb: AsyncAction) {
            addEventListener('WebComponentsReady', cb);
        }
    };

    windowWithWC.WebComponents.waitFor(action);
}

const boot = async () => {
    // Components necessary to start
    await import (
        /* webpackChunkName: "loader" */
        '@components/loader'
    );

    const body = document.body;
    const loader = document.createElement('phold-loader');
    body.appendChild(loader);

    await import(
        /* webpackChunkName: "app" */
        '@components/app'
    );

    console.log('Loaded app');
    const appElement = document.createElement('phold-app');
    body.appendChild(appElement);

    loader.setAttribute('hidden', '');
}

onLoadWebComponents(boot);
