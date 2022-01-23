/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
// import './examples/utils/env';
import { App, LogLevel } from '@slack/bolt';
import { isGenericMessageEvent } from '../utils/helpers';

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


// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
    // Filter out message events with subtypes (see https://api.slack.com/events/message)
    // Is there a way to do this in listener middleware with current type system?
    if (!isGenericMessageEvent(message)) return;

    // say() sends a message to the channel where the event was triggered
    await say({
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hey there <@${message.user}>!`,
                },
                accessory: {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Click Me',
                    },
                    action_id: 'button_click',
                },
            },
        ],
        text: `Hey there <@${message.user}>!`,
    });
});

app.action('button_click', async ({ body, ack, respond, client }) => {
    // Acknowledge the action
    await ack();
    // await client.chat.postEphemeral({text:`<@${body.user.id}> clicked the button`, channel: body.channel!.name!, user: body.user.id})
    await respond({response_type: 'ephemeral', text:`clicked the button`, replace_original: false})
    // await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 3000);

    console.log('⚡️ Bolt app is running!');
})();