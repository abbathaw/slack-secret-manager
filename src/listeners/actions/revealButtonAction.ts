import {App} from "@slack/bolt";
import * as storeService from "../../service/store-service";
import * as utils from "../../utils";
import * as encryptionService from "../../service/encryption-service";
import {revealSecretModal} from "../../component/reveal-secret-modal";
import {showAccessDenyModal} from "../../component/access-deny-modal";



const register = (app: App)=> {
    app.action('button-reveal', async (context) => {
        const { ack, logger, body, client } = context;

        // Acknowledge the action
        await ack();
        // @ts-ignore
        logger.info('reveal.value:', body.actions[0].value);

        const userId = body.user.id;

        // @ts-ignore
        const [uuid, decodeKey] = body.actions[0].value.split(':');

        try {
            const store = await storeService.retrieveSecret(uuid);

            // check if user is allow to view secret
            if (!utils.isValidUser(store.users, userId))
                throw new Error('Do not have permission to view secret');

            // check if secret has expired
            if (!utils.isValidExpiry(store.createdAt, store.expiry))
                throw new Error('Secret has expired');

            // decrypt the message
            const message = await encryptionService.decryptMessage(store.encrypted, decodeKey);

            // store the access log
            await storeService.createAuditTrail({ uuid, userId });

            // show pop up
            await revealSecretModal(Object.assign({ store, message }, context));

            // clean up
            if (store.onetime)
                await storeService.deleteMessage(uuid)
        }
        catch (error) {
            // @ts-ignore
            const errorMessage: string = error.message;
            logger.error({ uuid, userId, message: errorMessage });
            await storeService.createAuditTrail({ uuid, userId, valid: false });
            await showAccessDenyModal({client, body, message: errorMessage});
        }
    });

}

export {register}