import { App } from '@slack/bolt';
import * as utils from '../../utils';
import * as encryptionService from '../../service/encryption-service';
import * as storeService from '../../service/store-service';
import { displaySecretModal } from '../../component/display-secret-message';
import axios from 'axios';
import { getExpiry, getIfOneTime } from '../../utils';
import { ViewStateSelectedOption } from '@slack/bolt/dist/types/view';

// Saves the secret from the popup modal

type ResponseUrlType = {
    block_id: string;
    action_id: string;
    channel_id: string;
    response_url: string;
};

const register = (app: App) => {
    app.view('modal-create-secret', async (context) => {
        const { ack, payload, body, view, client, logger } = context;
        const modalValue = payload.state.values;

        await ack();

        try {
            const authorId = body['user']['id'];
            const value = {
                title: utils.getStateValue(modalValue, 'action-title'),
                message: utils.getStateValue(modalValue, 'action-message'),
                users: utils.getStateValue(modalValue, 'action-user'),
                conversation: utils.getStateValue(modalValue, 'action-conversations') as string,
                expiry: getExpiry(utils.getStateValue(modalValue, 'action-expiry') as ViewStateSelectedOption),
                onetime: getIfOneTime(utils.getStateValue(modalValue, 'action-visible') as ViewStateSelectedOption[]),
            };

            // save logic
            // use the openpgp https://github.com/jhaals/yopass/blob/master/next/src/utils.tsx
            const decodeKey = encryptionService.generateRandomKey();
            const encrypted = await encryptionService.encryptMessage(value.message, decodeKey);
            const store = await storeService.createSecret({
                encrypted,
                ...value,
                channelId: value.conversation,
                authorId,
                workspaceId: payload.team_id,
            });
            // @ts-ignore
            const response_urls: ResponseUrlType[] = body['response_urls'];

            const metadata = JSON.parse(body['view']['private_metadata']);
            let responseUrl = metadata.response_url;
            if (response_urls && response_urls.length > 0) {
                responseUrl = response_urls[0].response_url;
            }
            if (!store) {
                await axios.post(responseUrl, {
                    response_type: 'in_channel',
                    text: `Something happened while saving the secret. Please try again.`,
                });
            } else {
                await displaySecretModal(
                    Object.assign({ store, decodeKey, responseUrl, author: authorId }, value, context),
                );
            }
        } catch (e) {
            console.log('Error occurred', e);
        }
    });
};

export { register };
