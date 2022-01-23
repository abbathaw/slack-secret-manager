import { WebClient } from '@slack/web-api/dist/WebClient';
import {Action, SlackAction} from "@slack/bolt";

interface AccessDenyModalInterface {
    client: WebClient;
    body: SlackAction;
    message: string;
}

const showAccessDenyModal = async ({ client, body, message }: AccessDenyModalInterface) => {
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it

        // @ts-ignore // TODO check if this is correct
        trigger_id: body.trigger_id,
        // View payload
        view: {
            title: {
                type: 'plain_text',
                text: 'Access Deny',
                emoji: true
            },
            type: 'modal',
            close: {
                type: 'plain_text',
                text: 'Close',
                emoji: true
            },
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'plain_text',
                        text: message,
                        emoji: true
                    }
                }
            ]
        }
    });
    return result;
}

export {showAccessDenyModal}