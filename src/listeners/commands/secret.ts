import {App} from "@slack/bolt";
import {showCreateSecretModal} from "../../component/create-secret-modal";
import pick from "lodash.pick";
import {getSecretWithoutModal} from "../../service/create-secret";
import * as encryptionService from "../../service/encryption-service";
import * as storeService from "../../service/store-service";
import {displaySecretModal} from "../../component/display-secret-message";


const register = (app: App)=> {
    app.command('/secret', async (context) => {
        const { command, ack, respond, logger, body, client } = context;
        // Acknowledge command request
        await ack();
        try {
            if (command.text === "")
                await showCreateSecretModal(context);
            else {
                const decodeKey = encryptionService.generateRandomKey();
                const value = await getSecretWithoutModal(context)

                if (value.user) {
                    const usersList = await client.users.list({team_id: command.team_id})
                    const targetUser = usersList.members?.filter(user=> user.name===value.user.substring(1))

                    if (!targetUser || targetUser.length === 0) {
                        await respond({response_type: 'ephemeral', text:`User ${value.user} couldn't be found. Consider creating the secret using the modal by typing /secret only.`, replace_original: false})
                    } else {
                        const encrypted = await encryptionService.encryptMessage(value.message, decodeKey);
                        const users = [targetUser[0].id]
                        const store = await storeService.createSecret(Object.assign({encrypted}, {...value, users}, ));
                        const responseUrl = command.response_url;
                        const author = command.user_name;
                        await displaySecretModal(Object.assign({store, decodeKey, responseUrl, author}, value, context));
                    }
                } else {
                    await respond({response_type: 'ephemeral', text:`No user detected. Use this format /secret @target_user secret_message `, replace_original: false})
                }
            }
            logger.info('secret command:', pick(command, ['response_url', 'trigger_id']));
        }
        catch (error) {
            logger.error(error);
        }
    });
}

export {register}