import {WebClient} from "@slack/web-api/dist/WebClient";
import {SlackAction} from "@slack/bolt";

interface AccessLogModalInterface {
    accessLogs: any;
    client: WebClient;
    body: SlackAction;
}

const showAccessLogModal = async ({ accessLogs, client, body }: AccessLogModalInterface) => {
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        // @ts-ignore // TODO check if this is correct
        trigger_id: body.trigger_id,
        // View payload
        view: {
            type: 'modal',
            title: {
                type: 'plain_text',
                text: 'Access Log',
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
                    fields: [
                        {
                            type: 'mrkdwn',
                            text: '*Access timestamp*'
                        },
                        {
                            type: 'mrkdwn',
                            text: '*By*'
                        }
                    ]
                }
            ].concat(accessLogs.map((accessLog: any) => ({
                type: 'section',
                fields: [
                    {
                        type: 'plain_text',
                        text: accessLog.createdAt.toLocaleString(),
                    },
                    {
                        type: 'mrkdwn',
                        text: `<@${accessLog.userId}> - ${accessLog.valid ? 'Granted' : 'Deny'}`
                    }
                ]
            })))
        }
    });
    return result;
}

export {showAccessLogModal}