import { WebClient } from '@slack/web-api/dist/WebClient';
import { SlackAction, SlackShortcut } from '@slack/bolt';
import { SlashCommand } from '@slack/bolt/dist/types/command';
import { View } from '@slack/types';

interface CreateSecretModalInterface {
    client: WebClient;
    command: SlashCommand;
}

interface ShortcutCreateSecretModalInterface {
    client: WebClient;
    shortcut: SlackShortcut;
}

const showCreateSecretModalShorctut = async ({ shortcut, client }: ShortcutCreateSecretModalInterface) => {
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: shortcut.trigger_id,
        // View payload
        view: getViewModal(),
    });
    return result;
};

const showCreateSecretModal = async ({ command, client }: CreateSecretModalInterface) => {
    const channelId = command.channel_id;
    const responseUrl = command.response_url;
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: command.trigger_id,
        // View payload
        view: getViewModal(channelId, responseUrl),
    });
    return result;
};

const getViewModal = (channelId?: string, responseUrl?: string): View => {
    return {
        type: 'modal',
        // View identifier
        callback_id: 'modal-create-secret',
        private_metadata: JSON.stringify({
            channel_id: channelId,
            response_url: responseUrl,
        }),
        title: {
            type: 'plain_text',
            text: 'Share Secret',
        },
        blocks: [
            {
                type: 'input',
                optional: false,
                element: {
                    type: 'plain_text_input',
                    action_id: 'action-title',
                },
                label: {
                    type: 'plain_text',
                    text: 'Title',
                    emoji: true,
                },
            },
            {
                type: 'input',
                optional: false,
                element: {
                    type: 'plain_text_input',
                    multiline: true,
                    action_id: 'action-message',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Message to encrypt and share',
                    },
                },
                label: {
                    type: 'plain_text',
                    text: 'Secret Message',
                },
            },
            {
                type: 'input',
                optional: true,
                element: {
                    type: 'multi_users_select',
                    placeholder: {
                        type: 'plain_text',
                        text: 'Select users',
                        emoji: true,
                    },
                    action_id: 'action-user',
                },
                label: {
                    type: 'plain_text',
                    text: 'Authorize User',
                    emoji: true,
                },
            },
            {
                type: 'input',
                optional: true,
                element: {
                    type: 'static_select',
                    options: [
                        {
                            text: {
                                type: 'plain_text',
                                text: '1 hour',
                                emoji: true,
                            },
                            value: '3600',
                        },
                        {
                            text: {
                                type: 'plain_text',
                                text: '1 day',
                                emoji: true,
                            },
                            value: '86400',
                        },
                        {
                            text: {
                                type: 'plain_text',
                                text: '1 week',
                                emoji: true,
                            },
                            value: '604800',
                        },
                        {
                            text: {
                                type: 'plain_text',
                                text: 'Forever',
                                emoji: true,
                            },
                            value: '0',
                        },
                    ],
                    action_id: 'action-expiry',
                },
                label: {
                    type: 'plain_text',
                    text: 'Expiry Option',
                    emoji: true,
                },
            },
            {
                block_id: 'my_block_id',
                type: 'input',
                optional: !!channelId,
                label: {
                    type: 'plain_text',
                    text: 'Where would you like to share it',
                },
                element: {
                    action_id: 'action-conversations',
                    type: 'conversations_select',
                    response_url_enabled: true,
                    default_to_current_conversation: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: ' ',
                },
                accessory: {
                    type: 'checkboxes',
                    options: [
                        {
                            text: {
                                type: 'mrkdwn',
                                text: 'One-time visible',
                            },
                            value: 'one-time',
                        },
                    ],
                    action_id: 'action-visible',
                },
            },
        ],
        submit: {
            type: 'plain_text',
            text: 'Submit',
        },
    };
};

export { showCreateSecretModal, showCreateSecretModalShorctut };
