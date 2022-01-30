import { SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types/command';
import { AllMiddlewareArgs } from '@slack/bolt/dist/types/middleware';
import { DefaultSettingType } from '../models';

const getSecretWithoutModal = (
    context: SlackCommandMiddlewareArgs & AllMiddlewareArgs,
    defaultSettings: DefaultSettingType,
) => {
    const text = context.command.text;
    const channelId = context.command.channel_id;
    const title = defaultSettings.title;
    const expiry = defaultSettings.expiry;
    const onetime = defaultSettings.oneTime;

    let secretText = '';
    let user: any = [];

    let match,
        everybody = false;

    // digest the escape tagged <@U1234|user> <#C1234|general> <!here> <!channel>
    const regexp = new RegExp('<@([^|]+)|([^>]+)>', 'g');
    while ((match = regexp.exec(' ' + text)) !== null) {
        const escapedText = match[0].trim();
        secretText = text.substring(regexp.lastIndex);

        if (escapedText.substring(0, 2) === '<@') {
            const matchUserId = escapedText.match(/<@(.+)\|.+>/);
            if (matchUserId) user.push(matchUserId[1]);
        }

        if (escapedText === '<!here>' || escapedText === '<!channel>') {
            everybody = true;
        }
    }

    if (everybody) user.length = 0;

    const isValid = !(user.length === 0 && everybody === false);

    return {
        isValid,
        channelId,
        title,
        expiry,
        onetime,
        user,
        message: secretText,
    };
};

export { getSecretWithoutModal };
