import {App} from "@slack/bolt";
import * as storeService from "../../service/store-service";
import {showAccessLogModal} from "../../component/access-log-modal";



const register = (app: App)=> {
    app.action('button-access-log', async (context) => {
        const { ack, body, logger } = context;
        // Acknowledge the action
        await ack();

        try {

            // @ts-ignore TODO check this
            const uuid = body.actions[0].value;
            const accessLogs = await storeService.retrieveAuditTrail(uuid);
            await showAccessLogModal(Object.assign({ accessLogs }, context));
        }
        catch (error) {
            logger.error(error);
        }
    });
}

export {register}