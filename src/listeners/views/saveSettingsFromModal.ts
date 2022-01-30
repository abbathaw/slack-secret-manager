import { App } from '@slack/bolt';
import * as utils from '../../utils';
import { getExpiry, getIfOneTime } from '../../utils';
import { ViewStateSelectedOption } from '@slack/bolt/dist/types/view';
import { saveUserSettings } from '../../service/store-service';

const register = (app: App) => {
    app.view('modal-secret-shortcut-settings', async (context) => {
        const { ack, payload, body, view, client, logger } = context;
        const modalValue = payload.state.values;
        await ack();

        try {
            const authorId = body['user']['id'];
            const value = {
                title: utils.getStateValue(modalValue, 'settings-title') as string,
                expiry: getExpiry(utils.getStateValue(modalValue, 'settings-action-expiry') as ViewStateSelectedOption),
                onetime: getIfOneTime(
                    utils.getStateValue(modalValue, 'settings-action-visible') as ViewStateSelectedOption[],
                ),
            };
            await saveUserSettings({
                workspaceId: payload.team_id,
                userId: authorId,
                defaultExpiry: value.expiry,
                defaultOneTime: value.onetime,
                defaultTitle: value.title,
            });
        } catch (e) {
            console.log('Error occurred', e);
        }
    });
};

export { register };
