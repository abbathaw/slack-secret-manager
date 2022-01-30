import { App } from '@slack/bolt';
import { showCreateSecretModalShorctut } from '../../component/create-secret-modal';
import { getUserSettings } from '../../service/store-service';
import { parseDefaultSettings } from '../../utils';

const register = (app: App) => {
    app.shortcut('secret_shortcut', async (context) => {
        await context.ack();
        const teamId = context.payload.user.team_id;
        let userSettings = parseDefaultSettings();
        if (teamId) {
            const dbSettings = await getUserSettings(teamId, context.payload.user.id);
            userSettings = parseDefaultSettings(dbSettings);
        }

        await showCreateSecretModalShorctut(context, userSettings);
    });
};

export { register };
