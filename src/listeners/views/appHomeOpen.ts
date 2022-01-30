import { App } from '@slack/bolt';
import { getLogger } from '@slack/web-api/dist/logger';

const register = (app: App) => {
    app.event('app_home_opened', async ({ event, client, logger }) => {
        try {
            // Call views.publish with the built-in client
            const result = await client.views.publish({
                // Use the user ID associated with the event
                user_id: event.user,
                view: {
                    // Home tabs must be enabled in your app configuration page under "App Home"
                    type: 'home',
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: 'Secret Manager Setting Page',
                                emoji: true,
                            },
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'checkboxes',
                                    options: [
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Enable audit log',
                                                emoji: true,
                                            },
                                            description: {
                                                type: 'plain_text',
                                                text: 'Log the access when user click reveal secret',
                                                emoji: true,
                                            },
                                            value: 'enable-audit-log',
                                        },
                                        {
                                            text: {
                                                type: 'plain_text',
                                                text: 'Secret shortcut',
                                                emoji: true,
                                            },
                                            description: {
                                                type: 'plain_text',
                                                text: 'Allow user to create secret from /secret without the modal',
                                                emoji: true,
                                            },
                                            value: 'secret-shortcut',
                                        },
                                    ],
                                    action_id: 'app-home-setting',
                                },
                            ],
                        },
                    ],
                },
            });

            logger.info(result);
        } catch (error) {
            logger.error(error);
        }
    });
};

export { register };
