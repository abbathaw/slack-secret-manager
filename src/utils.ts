import { ViewStateSelectedOption, ViewStateValue } from '@slack/bolt/dist/types/view';
import { Message } from './models';

const findKey = require('lodash.findkey');

type ValuesType = {
    [blockId: string]: {
        [actionId: string]: ViewStateValue;
    };
};

function getStateValue(values: ValuesType, name: string) {
    const key = findKey(values, name);
    const value = values[key][name];

    switch (value.type) {
        case 'plain_text_input':
            return value.value;
        case 'multi_users_select':
            return value.selected_users;
        case 'static_select':
            return value.selected_option;
        case 'checkboxes':
            return value.selected_options;
        case 'conversations_select':
            return value.selected_conversation;
        case 'multi_conversations_select':
            return value.selected_conversations;
        default:
            return null;
    }
}

function isValidUser(message: Message, userId: string) {
    const list = message.users;
    if (message.authorId === userId) {
        return true;
    } else {
        return list.length === 0 || list.indexOf(userId) !== -1;
    }
}

function isValidExpiry(expiry: number) {
    const now = new Date().getTime();
    const nowTimestamp = Math.floor(now / 1000);
    return nowTimestamp < expiry;
}

const getExpiry = (expiryValue?: ViewStateSelectedOption): number => {
    console.log('WHAT IS EXPIRY', expiryValue);
    if (expiryValue && expiryValue.value !== undefined) {
        try {
            return parseInt(expiryValue.value);
        } catch (e) {
            return 0;
        }
    } else {
        return 0;
    }
};

const getIfOneTime = (oneTimeValue?: ViewStateSelectedOption[]): boolean => {
    return !!oneTimeValue && Array.isArray(oneTimeValue) && oneTimeValue.length > 0;
};

const calculateTTL = (expiry: number) => {
    const toAdd = !!expiry && expiry !== 0 ? expiry * 1000 : 3650 * 24 * 60 * 60 * 1000;
    const timestamp = new Date().getTime() + toAdd;
    return Math.floor(timestamp / 1000);
};

export { getStateValue, isValidUser, isValidExpiry, getExpiry, getIfOneTime, calculateTTL };
