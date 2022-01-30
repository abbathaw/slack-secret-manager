import { View } from '@slack/types';
import { DefaultSettingType } from '../models';
import {
    checkBoxOptions,
    expiryOptions,
    getCheckboxAccessory,
    getStaticSelectElement,
} from '../utils/defaultOptionsHelper';

export const getSettingsModal = (userSettings: DefaultSettingType): View => {
    return {
        type: 'modal',
        // View identifier
        callback_id: 'modal-secret-shortcut-settings',
        title: {
            type: 'plain_text',
            text: 'Secret Shortcut Settings',
        },
        blocks: [
            {
                type: 'input',
                optional: false,
                element: {
                    type: 'plain_text_input',
                    action_id: 'settings-title',
                    initial_value: `${userSettings.title}`,
                },
                label: {
                    type: 'plain_text',
                    text: 'Secret Shortcuts Default Title',
                    emoji: true,
                },
            },
            {
                type: 'input',
                element: getStaticSelectElement(expiryOptions, userSettings),
                label: {
                    type: 'plain_text',
                    text: 'Expiry Option',
                    emoji: true,
                },
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: ' ',
                },
                accessory: getCheckboxAccessory(checkBoxOptions, userSettings),
            },
        ],
        submit: {
            type: 'plain_text',
            text: 'Submit',
        },
    };
};
