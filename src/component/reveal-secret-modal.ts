import { WebClient } from '@slack/web-api/dist/WebClient';


interface RevealSecretModalInterface {
    client: WebClient;
    body: any;
    store: any;
    message: string;
}

const revealSecretModal = async ({ client, body, store, message }: RevealSecretModalInterface) => {
    const { createdAt, expiry = 0 } = store;
    const expiredTime = new Date(createdAt.getTime());
    expiredTime.setSeconds(expiredTime.getSeconds() + expiry);
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: body.trigger_id,
        // View payload
        view: {
            type: 'modal',
            title: {
                type: 'plain_text',
                text: 'Secret Title',
                emoji: true
            },
            close: {
                type: 'plain_text',
                text: 'Close',
                emoji: true
            },
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '*Message*\n```' + message + '```',
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'plain_text',
                            text: `This message will expire on ${expiredTime.toDateString()}.`,
                            emoji: true
                        }
                    ]
                }
            ]
        }
    });
    return result;
}

export {revealSecretModal};