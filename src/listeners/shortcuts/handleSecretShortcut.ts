import { App } from '@slack/bolt';
import { showCreateSecretModalShorctut } from '../../component/create-secret-modal';

const register = (app: App) => {
    app.shortcut('secret_shortcut', async (context) => {
        await context.ack();
        await showCreateSecretModalShorctut(context);
    });
};

export { register };
