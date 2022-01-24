import {App} from "@slack/bolt";
import * as utils from "../../utils";
import * as encryptionService from "../../service/encryption-service";
import * as storeService from "../../service/store-service";
import {displaySecretModal} from "../../component/display-secret-message";

// Saves the secret from the popup modal

type ResponseUrlType = {
    block_id: string,
    action_id: string,
    channel_id: string,
    response_url: string,
}

const register = (app: App)=> {
    app.view('modal-create-secret', async (context) => {
        const {ack, payload, body, view, client, logger} = context;
        const modalValue = payload.state.values;
        logger.info('create.private_metadata:', JSON.parse(body.view.private_metadata));
        // bolt-app create.private_metadata: {
        //     channel_id: 'C02UCMX317Y',
        //         response_url: 'https://hooks.slack.com/commands/T02V94KTNEL/2990894353221/HOWjlplkEpAUzd3XpJxM4EYj'
        // }

        logger.info('create.values:', JSON.stringify(modalValue));
        await ack();

        try {
            const value = {
                title: utils.getStateValue(modalValue, 'action-title'),
                message: utils.getStateValue(modalValue, 'action-message'),
                users: utils.getStateValue(modalValue, 'action-user'),
                conversation: utils.getStateValue(modalValue, 'action-conversations'),

                // @ts-ignore TODO FIX possible null
                expiry: parseInt(utils.getStateValue(modalValue, 'action-expiry').value),

                // @ts-ignore TODO FIX possible null and length is not valid for different options
                onetime: utils.getStateValue(modalValue, 'action-visible')!.length > 0,
            };

            // save logic
            // use the openpgp https://github.com/jhaals/yopass/blob/master/next/src/utils.tsx
            const decodeKey = encryptionService.generateRandomKey();
            const encrypted = await encryptionService.encryptMessage(value.message, decodeKey);
            const store = await storeService.createSecret(Object.assign({encrypted}, value));

            // @ts-ignore
            const response_urls: ResponseUrlType[] = body["response_urls"] ;

            const metadata = JSON.parse(body['view']['private_metadata'])
            let responseUrl =  metadata.response_url;
            if (response_urls && response_urls.length > 0) {
                responseUrl = response_urls[0].response_url;
            }
            const author = body['user']['id'];
            await displaySecretModal(Object.assign({store, decodeKey, responseUrl, author}, value, context));

        } catch(e){
            console.log("Error occured", e)
        }
    });
}

export {register}