import { App } from '@slack/bolt';
import * as storeService from '../../service/store-service';
import * as utils from '../../utils';
import * as encryptionService from '../../service/encryption-service';
import { revealSecretModal } from '../../component/reveal-secret-modal';
import { showAccessDenyModal } from '../../component/access-deny-modal';

const register = (app: App) => {
    app.action('button-reveal', async (context) => {
        const { ack, logger, body, client, payload, action } = context;

        // Acknowledge the action
        await ack();

        const userId = body.user.id;
        const workplaceId = body.user.team_id || '';
        if (!workplaceId) {
            console.error('No workplace Id found', body);
        }

        // @ts-ignore
        const [uuid, decodeKey] = body.actions[0].value.split(':');

        try {
            const store = await storeService.retrieveSecret(uuid, workplaceId);

            const secret = store.secret;
            const message = store.message;

            if (!secret) throw new Error('Secret has expired and permanently deleted.');
            if (!message) throw new Error('Secret has been deleted');

            // check if user is allow to view secret
            if (!utils.isValidUser(message, userId)) throw new Error('Do not have permission to view secret');

            // check if secret has expired
            if (!utils.isValidExpiry(message.expiry)) throw new Error('Secret has expired');

            // decrypt the message
            const messageContent = await encryptionService.decryptMessage(secret.encrypted, decodeKey);

            // store the access log
            await storeService.createAuditTrail({ uuid, userId });

            // show pop up
            await revealSecretModal(Object.assign({ store, messageContent }, context));

            // clean up
            if (message.onetime) await storeService.deleteMessage(uuid);
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.message;
            logger.error({ uuid, userId, message: errorMessage });
            await storeService.createAuditTrail({ uuid, userId, valid: false });
            await showAccessDenyModal({ client, body, message: errorMessage });
        }
    });
};

export { register };
