import { App } from '@slack/bolt';
import { getLogger } from '@slack/web-api/dist/logger';

const register = (app: App) => {
    app.event('app_home_opened', async ({ event, client, logger }) => {
        try {
            // Call views.publish with the built-in client
            await client.views.publish({
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
                                text: 'Secret Manager',
                                emoji: true,
                            },
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'plain_text',
                                text: 'Secret manager helps you in securely sharing secrets and passwords in channels or private messages to only the users you define.',
                                emoji: true,
                            },
                        },
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '\n Define an expiry limit for the shared password, and view audit logs of who tried to view your password.\n',
                            },
                        },
                        {
                            type: 'divider',
                        },
                        {
                            // empty line
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '\n',
                            },
                        },

                        {
                            // Section with text and a button
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '*Create a Secret* \nBy typing `/secret` only, it will open a modal to let you select multiple users, define a certain channel and set a multiline secret.',
                            },
                        },

                        {
                            // Section with text and a button
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '*Vault Shortcut* \nYou can quickly view shared non-expired secrets that you have access to in that channel by typing `/vault`',
                            },
                        },
                        {
                            // Section with text and a button
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '*Secret Shortcut!* \nYou can quickly create secrets in one line by typing `/secret <@user> my-secret`',
                            },
                            accessory: {
                                type: 'button',
                                action_id: 'configure-settings',
                                text: {
                                    type: 'plain_text',
                                    text: 'Configure default settings',
                                },
                            },
                        },
                    ],
                },
            });
        } catch (error) {
            logger.error(error);
        }
    });
};

export { register };
