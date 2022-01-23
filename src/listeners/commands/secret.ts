import {App} from "@slack/bolt";
import {showCreateSecretModal} from "../../component/create-secret-modal";
import pick from "lodash.pick";


const register = (app: App)=> {
    app.command('/secret', async (context) => {
        const { command, ack, respond, logger, body } = context;
        // Acknowledge command request
        await ack();
        try {
            if (command.text === "")
                await showCreateSecretModal(context);
            else
                await respond(`${JSON.stringify(command, null, 2)}`);
            logger.info('secret command:', pick(command, ['response_url', 'trigger_id']));
        }
        catch (error) {
            logger.error(error);
        }
    });
}

export {register}