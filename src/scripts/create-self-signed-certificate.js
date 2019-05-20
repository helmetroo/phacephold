const readline = require('readline'),
      util = require('util'),
      fs = require('fs'),
      path = require('path'),

      selfsigned = require('selfsigned');

const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        const questionWithTrailingSpace = question + ' ';
        readlineInterface.question(questionWithTrailingSpace, (response) => {
            return resolve(response);
        });
    });
}

const beginCreateSignedCert = async () => {
    const days = await requestExpiryDays();
    const pems = await createPems(days);

    try {
        await saveSignedCert(pems);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
}

const requestExpiryDays = async () => {
    const defaultExpiryDays = 1024;
    const expiryDaysStr = await askQuestion(`Days until the certificate expires? (Defaults to ${defaultExpiryDays})`);
    const expiryDays = parseInt(expiryDaysStr, 10);
    if(isNaN(expiryDays))
        return defaultExpiryDays;

    if(expiryDays === 0) {
        console.error('Number of days (must be > 1).');
        return requestExpiryDays();
    }

    return expiryDays;
}

const generateCert = async (attrs, options) => {
    return new Promise((resolve, reject) => {
        selfsigned.generate(attrs, options, (err, pems) => {
            if(err)
                return reject(err);

            return resolve(pems);
        });
    });
};

const createPems = async (days) => {
    return generateCert(null, {
        keySize: 2048,
        days: days,
        algorithm: 'sha256'
    });
}

const saveSignedCert = async (pems) => {
    const writeFile = util.promisify(fs.writeFile);
    const basePath = require('app-root-path').toString();
    const packageManifest = require(path.join(basePath, 'package.json'));

    const defaultCertificateFilename = 'server.crt';
    let certFileName = defaultCertificateFilename;

    const defaultPrivateKeyFilename = 'server.key';
    let privateKeyFileName = defaultPrivateKeyFilename;

    const packageConfig = packageManifest.config;
    if(packageConfig) {
        const httpsConfig = packageConfig.https;
        if(httpsConfig) {
            certFileName = certFileName || packageConfig.certificate;
            privateKeyFileName = privateKeyFileName || packageConfig.privateKeyificate;
        }
    }

    const certPath = path.join(basePath, certFileName);
    const privateKeyPath = path.join(basePath, privateKeyFileName);

    await writeFile(certPath, pems.cert.toString());
    console.log(`Saved certificate to ${certPath}.`);

    await writeFile(privateKeyPath, pems.private.toString());
    console.log(`Saved private key to ${privateKeyPath}.`);

    console.log('Done!');
}

beginCreateSignedCert();
