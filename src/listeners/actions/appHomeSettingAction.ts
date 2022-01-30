import { App, BlockAction } from '@slack/bolt';
import { getSettingsModal } from '../../component/secrets-settings-modal';
import { getUserSettings } from '../../service/store-service';
import { parseDefaultSettings } from '../../utils';

const register = (app: App) => {
    app.action('configure-settings', async (context) => {
        const { ack, logger, body, client, action } = context;

        await ack();
        // Update the message to reflect the action
        const bodyT = body as BlockAction;
        const triggerId = bodyT.trigger_id;
        const teamId = bodyT.user.team_id;

        let userSettings = parseDefaultSettings();
        if (teamId) {
            const dbSettings = await getUserSettings(teamId, bodyT.user.id);
            userSettings = parseDefaultSettings(dbSettings);
        }

        await client.views.open({
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: triggerId,
            // View payload
            view: getSettingsModal(userSettings),
        });
    });
};

export { register };
