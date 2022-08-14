import { App, LogLevel } from '@slack/bolt';

import './utils/env';
import registerListeners from './listeners';

export const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.INFO,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
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
    ],
});

registerListeners(app);

(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();
