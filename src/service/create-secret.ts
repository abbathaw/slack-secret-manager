import { SlackCommandMiddlewareArgs } from '@slack/bolt/dist/types/command';
import { AllMiddlewareArgs } from '@slack/bolt/dist/types/middleware';

// interface ICreateSecret {
//     channelId?: string;
//     title: any;
//     encrypted: any;
//     users: any;
//     expiry?: any;
//     onetime: boolean;
//     conversation?: any;
// }

const getSecretWithoutModal = (context: SlackCommandMiddlewareArgs & AllMiddlewareArgs) => {
    const text = context.command.text;
    const channelId = context.command.channel_id;
    const title = 'Instant Secret'; // TODO fix this later to be changed by user preferences
    const expiry = 3600; // TODO fix this later to be changed by user preferences
    const onetime = false;

    let secretText = '';
    let user: any = [];

    let match,
        everybody = false;

    // digest the escape tagged <@U1234|user> <#C1234|general> <!here> <!channel>
    const regexp = new RegExp('<@([^|]+)|([^>]+)>', 'g');
    while ((match = regexp.exec(' ' + text)) !== null) {
        const escapedText = match[0].trim();
        context.logger.info('instant.user:', { escapedText, start: match.index, end: regexp.lastIndex });
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
