import {App} from "@slack/bolt";
import * as utils from "../../utils";
import * as encryptionService from "../../service/encryption-service";
import * as storeService from "../../service/store-service";
import {displaySecretModal} from "../../component/display-secret-message";



const register = (app: App)=> {
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

}

export {register}