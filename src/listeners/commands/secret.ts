import { App } from '@slack/bolt';
import { showCreateSecretModal } from '../../component/create-secret-modal';
import pick from 'lodash.pick';
import { getSecretWithoutModal } from '../../service/create-secret';
import * as encryptionService from '../../service/encryption-service';
import * as storeService from '../../service/store-service';
import { displaySecretModal } from '../../component/display-secret-message';
import { getUserSettings } from '../../service/store-service';
import { parseDefaultSettings } from '../../utils';

const register = (app: App) => {
    app.command('/secret', async (context) => {
        const { command, ack, respond, logger, body, client } = context;
        // Acknowledge command request
        await ack();
        try {
            const author = command.user_id;
            const userSettings = await getUserSettings(command.team_id, author);
            const defaultSettings = parseDefaultSettings(userSettings);
            if (command.text === '') await showCreateSecretModal(context, defaultSettings);
            else {
                const decodeKey = encryptionService.generateRandomKey();
                const value = getSecretWithoutModal(context, defaultSettings);

                if (value.isValid) {
                    const author = command.user_name;
                    const encrypted = await encryptionService.encryptMessage(value.message, decodeKey);
                    const users = value.user;

                    const store = await storeService.createSecret({
                        encrypted,
                        users,
                        conversation: value.channelId,
                        ...value,
                        authorId: command.user_id,
                        workspaceId: body.team_id,
                    });
                    if (!store) {
                        await respond({
                            response_type: 'ephemeral',
                            text: `Something happened while saving the secret. Please try again.`,
                            replace_original: false,
                        });
                    }
                    const responseUrl = command.response_url;

                    await displaySecretModal(Object.assign({ store, decodeKey, responseUrl, author }, value, context));
                } else {
                    await respond({
                        response_type: 'ephemeral',
                        text: `No user detected. Use this format /secret @target_user secret_message `,
                        replace_original: false,
                    });
                }
            }
        } catch (error) {
            logger.error(error);
        }
    });
};

export { register };
