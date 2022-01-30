import { MrkdwnOption, StaticSelect, View } from '@slack/types';
import { Checkboxes, PlainTextOption } from '@slack/bolt';

interface DefaultSettingType {
    title: string;
    expiry: number;
    oneTime: boolean;
}

const expiryOptions: PlainTextOption[] = [
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
];

const checkBoxOptions: MrkdwnOption[] = [
    {
        text: {
            type: 'mrkdwn',
            text: 'One-time visible',
        },
        value: 'one-time',
    },
];

const getStaticSelectElement = (options: PlainTextOption[], userSettings: DefaultSettingType) => {
    const element: StaticSelect = {
        type: 'static_select',
        options: options,
        action_id: 'settings-action-expiry',
    };

    element['initial_option'] = options.filter((o) => Number(o.value) === userSettings.expiry)[0] as PlainTextOption;

    return element;
};

const getCheckboxAccessory = (options: MrkdwnOption[], userSettings: DefaultSettingType) => {
    const accessory: Checkboxes = {
        type: 'checkboxes',
        options: checkBoxOptions,
        action_id: 'settings-action-visible',
    };
    if (userSettings.oneTime) {
        accessory['initial_options'] = options;
    }
    return accessory;
};

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
