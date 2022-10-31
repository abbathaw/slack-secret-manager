const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName: string, version='latest') {
    const [secret] = await client.accessSecretVersion({
        name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/${version}`,
    });
    const payload = secret.payload.data.toString('utf8')
    return payload;
}

export default getSecret;