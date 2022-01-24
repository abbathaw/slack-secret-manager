import {ViewStateValue} from "@slack/bolt/dist/types/view";

const findKey = require('lodash.findkey');

type ValuesType = {
    [blockId: string]: {
        [actionId: string]: ViewStateValue;
    };
};

function getStateValue(values: ValuesType, name: string) {
    const key = findKey(values, name);
    const value = values[key][name];

    switch(value.type) {
        case 'plain_text_input': return value.value;
        case 'multi_users_select': return value.selected_users;
        case 'static_select': return value.selected_option;
        case 'checkboxes': return value.selected_options;
        case 'conversations_select': return value.selected_conversation;
        case 'multi_conversations_select': return value.selected_conversations;
        default: return null;
    }
}

function isValidUser(list: any, userId: string) {
    return list.length === 0 || list.indexOf(userId) !== -1;
}

function isValidExpiry(createdAt: any, expiry: any) {
    const now = new Date();
    const expiredTime = new Date(createdAt.getTime());
    expiredTime.setSeconds(expiredTime.getSeconds() + expiry);

    return now.getTime() < expiredTime.getTime();
}

export {
    getStateValue,
    isValidUser,
    isValidExpiry,
};
