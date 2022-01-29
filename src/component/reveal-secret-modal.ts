import { WebClient } from '@slack/web-api/dist/WebClient';
import { SecretRetrievedType } from '../service/store-service';
import { Message } from '../models';

interface RevealSecretModalInterface {
    client: WebClient;
    body: any;
    store: SecretRetrievedType;
    messageContent: string;
}

const revealSecretModal = async ({ client, body, store, messageContent }: RevealSecretModalInterface) => {
    const { message } = store;
    const expiryValue = message ? message.expiry : null;
    let toExpireIn = '';
    if (expiryValue) {
        const expiredTime = new Date(expiryValue * 1000);
        toExpireIn = `This message will expire on ${expiredTime.toDateString()}.`;
    }
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view: {
            type: 'modal',
            title: {
                type: 'plain_text',
                text: 'Secret Title',
                emoji: true,
            },
            close: {
                type: 'plain_text',
                text: 'Close',
                emoji: true,
            },
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Message*\n```' + messageContent + '```',
                    },
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'plain_text',
                            text: toExpireIn,
                            emoji: true,
                        },
                    ],
                },
            ],
        },
    });
    return result;
};

export { revealSecretModal };
