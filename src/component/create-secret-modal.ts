import { WebClient } from '@slack/web-api/dist/WebClient';
import { SlackShortcut } from '@slack/bolt';
import { SlashCommand } from '@slack/bolt/dist/types/command';
import { View } from '@slack/types';
import { DefaultSettingType } from '../models';
import {
    checkBoxOptions,
    expiryOptions,
    getCheckboxAccessory,
    getStaticSelectElement,
} from '../utils/defaultOptionsHelper';

interface CreateSecretModalInterface {
    client: WebClient;
    command: SlashCommand;
}

interface ShortcutCreateSecretModalInterface {
    client: WebClient;
    shortcut: SlackShortcut;
}

const showCreateSecretModalShorctut = async (
    { shortcut, client }: ShortcutCreateSecretModalInterface,
    defaultSettings: DefaultSettingType,
) => {
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: shortcut.trigger_id,
        // View payload
        view: getViewModal(defaultSettings),
    });
    return result;
};

const showCreateSecretModal = async (
    { command, client }: CreateSecretModalInterface,
    defaultSettings: DefaultSettingType,
) => {
    const channelId = command.channel_id;
    const responseUrl = command.response_url;
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        trigger_id: command.trigger_id,
        // View payload
        view: getViewModal(defaultSettings, channelId, responseUrl),
    });
    return result;
};

const getViewModal = (defaultSettings: DefaultSettingType, channelId?: string, responseUrl?: string): View => {
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
                    initial_value: `${defaultSettings.title}`,
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
                optional: false,
                element: getStaticSelectElement(expiryOptions, defaultSettings),
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
                accessory: getCheckboxAccessory(checkBoxOptions, defaultSettings),
            },
        ],
        submit: {
            type: 'plain_text',
            text: 'Submit',
        },
    };
};

export { showCreateSecretModal, showCreateSecretModalShorctut };
