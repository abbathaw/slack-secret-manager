import { App } from '@slack/bolt';
import { isGenericMessageEvent } from '../../utils/helpers';

const register = (app: App) => {
    app.message('shared a secret', async ({ message, say, payload }) => {
        if (!isGenericMessageEvent(message)) return;
        console.log('message', message);
        console.log('what elseee', message.bot_profile);
        console.log('what else BOT', message.bot_id);
    });
};

export { register };
