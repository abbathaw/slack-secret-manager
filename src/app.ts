import { App, LogLevel } from '@slack/bolt';

import './utils/env';
import pick from 'lodash.pick';
import * as utils from './utils';
import * as encryptionService from './service/encryption-service';
import * as storeService from './service/store-service';
import {showAccessDenyModal} from "./component/access-deny-modal";
import {showAccessLogModal} from "./component/access-log-modal";
import {showCreateSecretModal} from "./component/create-secret-modal";
import {displaySecretModal} from "./component/display-secret-message";
import {revealSecretModal} from "./component/reveal-secret-modal";

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: 3000
});

app.use(async ({ next }) => {
    // TODO: This can be improved in future versions
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await next!();
});

app.command('/secret', async (context) => {
    const { command, ack, respond, logger, body } = context;
    // Acknowledge command request
    await ack();
    try {
        if (command.text === "")
            await showCreateSecretModal(context);
        else
            await respond(`${JSON.stringify(command, null, 2)}`);
        logger.info('secret command:', pick(command, ['response_url', 'trigger_id']));
    }
    catch (error) {
        logger.error(error);
    }
});

app.view('modal-create-secret', async (context) => {
    const {  ack, payload, body, view, client, logger  } = context;
    const modalValue = payload.state.values;
    logger.info('create.private_metadata:', JSON.parse(body.view.private_metadata));
    // logger.info('create.values:', modalValue);
    await ack();


    const value = {
        title: utils.getStateValue(modalValue, 'action-title'),
        message: utils.getStateValue(modalValue, 'action-message'),
        users: utils.getStateValue(modalValue, 'action-user'),
        // @ts-ignore TODO FIX possible null
        expiry: parseInt(utils.getStateValue(modalValue, 'action-expiry').value),
        // @ts-ignore TODO FIX possible null and length is not valid for different options
        onetime: utils.getStateValue(modalValue, 'action-visible')!.length > 0,
    };

    // save logic
    // use the openpgp https://github.com/jhaals/yopass/blob/master/next/src/utils.tsx
    const decodeKey = encryptionService.generateRandomKey();
    const encrypted = await encryptionService.encryptMessage(value.message, decodeKey);
    const store = await storeService.createSecret(Object.assign({ encrypted }, value));

    displaySecretModal(Object.assign({ store, decodeKey }, value, context));
});

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

app.action('button-access-log', async (context) => {
    const { ack, body, logger } = context;
    // Acknowledge the action
    await ack();

    try {

        // @ts-ignore TODO check this
        const uuid = body.actions[0].value;
        const accessLogs = await storeService.retrieveAuditTrail(uuid);
        await showAccessLogModal(Object.assign({ accessLogs }, context));
    }
    catch (error) {
        logger.error(error);
    }
});



(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();