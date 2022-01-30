import { App } from '@slack/bolt';

const register = (app: App) => {
    app.action('app-home-setting', async (context) => {
        const { ack, logger, body, client } = context;

        await ack();
        // Update the message to reflect the action
        // @ts-ignore
        const selectedOptions = body.actions[0].selected_options.map((o) => o.value);
        logger.info('setting.options:', selectedOptions);
    });
};

export { register };
