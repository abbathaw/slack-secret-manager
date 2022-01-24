const openpgp = require('openpgp');

function generateRandomKey() {
    return Math.random().toString(36).substr(2, 6) + Math.random().toString(36).substr(2, 6);
}

async function encryptMessage(message: any, decodeKey: string) {
    if (decodeKey == null)
        throw new Error('decodeKey should not be null');

    // @ts-ignore //todo is this correct
    const binary = new TextEncoder('utf-8').encode(message);
    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        passwords: [decodeKey],
    });

    return encrypted;
}

async function decryptMessage(data: any, decodeKey: string) {
    const { data: decrypted } = await openpgp.decrypt({
        message: await openpgp.readMessage({ armoredMessage: data }),
        passwords: [decodeKey],
    });
    return decrypted;
}

export {
    generateRandomKey,
    encryptMessage,
    decryptMessage,
};