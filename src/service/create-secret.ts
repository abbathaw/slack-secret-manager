import {SlackCommandMiddlewareArgs} from "@slack/bolt/dist/types/command";
import {AllMiddlewareArgs} from "@slack/bolt/dist/types/middleware";


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
    const title = "Instant Secret"; // TODO fix this later to be changed by user preferences
    const expiry = 3600; // TODO fix this later to be changed by user preferences
    const onetime = false;


    let secretText = '';
    let user = '';

    if (text.trim().charAt(0) === "@") {
        const splitText = text.trim().split(" ")
        user = splitText[0];
        secretText = splitText.slice(1).join(" ")
    } else {
        secretText = text.trim()
    }

    return {
        channelId, title, expiry, onetime, user, message: secretText
    }
}

export {getSecretWithoutModal}