const os = require('os');

const localhostIPAddr = '127.0.0.1';

// https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js#comment95280544_8440736
const networkInterfaces = os.networkInterfaces();
const [localIPAddr] = Object.values(networkInterfaces).reduce(
    (r, list) =>
        r.concat(
            list.reduce(
                (rr, i) => rr.concat(i.family === 'IPv4' && !i.internal && i.address || []), []
            )
        ),
    []
);

const defaultServerOptions =
      require('@commonshost/server/src/configuration/default/options').defaultOptions;

const phacepholdOptions = {
    hosts: [{
        domain: localhostIPAddr,
        root: './dist'
    }, {
        domain: localIPAddr,
        root: './dist'
    }]
};

const options =
      Object.assign(defaultServerOptions, phacepholdOptions);

const startServer =
      require('@commonshost/server/src/commands/start').handler;

startServer({
    options,
    watch: false
});
