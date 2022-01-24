const axios = require('axios');

interface DisplaySecretModalInterface {
    body: any;
    store: any;
    decodeKey: string;
    title: any;
    responseUrl: string;
}

const displaySecretModal = async ({ body, store, decodeKey, title, responseUrl }: DisplaySecretModalInterface) => {
    const user = body['user']['id'];

    const result = await axios.post(responseUrl, {
        response_type: 'in_channel',
        blocks: getBlocks(decodeKey, store, title, user)
    });

    return result;
}

const getBlocks = (decodeKey: string, store: any, title: string | undefined, user: any) => {
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `<@${user}> share a secret *${title || '<Untitled Secret>'}*`,
            }
        },
        {
            type: 'actions',
            block_id: 'actionblock-secret',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Reveal Secret'
                    },
                    value: `${store.uuid}:${decodeKey}`,
                    action_id: 'button-reveal',
                },
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Access Log',
                    },
                    value: `${store.uuid}`,
                    action_id: 'button-access-log',
                }
            ]
        }
    ]
}

export {displaySecretModal}