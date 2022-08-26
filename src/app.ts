import { App, LogLevel } from '@slack/bolt';

import './utils/env';
import registerListeners from './listeners';
import getSecret from "./service/secret-manager-service";

async function loadSecretsAndApp() {
    const loadFromSecretManager = process.env.LOAD_SECRET_MANAGER && process.env.LOAD_SECRET_MANAGER === 'true'
    const botToken = loadFromSecretManager ? await getSecret(`${process.env.SECRET_PREFIX}${process.env.SLACK_BOT_TOKEN}`) : process.env.SLACK_BOT_TOKEN
    const signingSecret = loadFromSecretManager ? await getSecret(`${process.env.SECRET_PREFIX}${process.env.SLACK_SIGNING_SECRET}`) : process.env.SLACK_SIGNING_SECRET
    const appToken = loadFromSecretManager ? await getSecret(`${process.env.SECRET_PREFIX}${process.env.SLACK_APP_TOKEN}`): process.env.SLACK_APP_TOKEN

    const app = new App({
        token: botToken,
        signingSecret: signingSecret,
        logLevel: LogLevel.INFO,
        socketMode: true,
        appToken: appToken,
        port: (Number(process.env.PORT) || 3000),
        customRoutes: [
            {
                path: '/',
                method: ['GET'],
                handler: (req, res) => {
                    res.writeHead(200);
                    res.end('Health check!');
                },
            },
            {
                path: '/_ah/warmup',
                method: ['GET'],
                handler: (req, res) => {
                    res.writeHead(200);
                    res.end('Warmup done!');
                },
            },
        ],
    });
    registerListeners(app);

    return app;
}





(async () => {
    // Start your app
    const app = await loadSecretsAndApp();
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();
