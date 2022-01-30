import { Checkboxes, PlainTextOption } from '@slack/bolt';
import { MrkdwnOption, StaticSelect } from '@slack/types';
import { DefaultSettingType } from '../models';

export const expiryOptions: PlainTextOption[] = [
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

export const checkBoxOptions: MrkdwnOption[] = [
    {
        text: {
            type: 'mrkdwn',
            text: 'One-time visible',
        },
        value: 'one-time',
    },
];

export const getStaticSelectElement = (options: PlainTextOption[], userSettings: DefaultSettingType) => {
    const element: StaticSelect = {
        type: 'static_select',
        options: options,
        action_id: 'settings-action-expiry',
    };

    element['initial_option'] = options.filter((o) => Number(o.value) === userSettings.expiry)[0] as PlainTextOption;

    return element;
};

export const getCheckboxAccessory = (options: MrkdwnOption[], userSettings: DefaultSettingType) => {
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
