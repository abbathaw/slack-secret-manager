import { App } from '@slack/bolt';
import * as secretCommand from './commands/secret';
import * as vaultCommand from './commands/vault';
import * as createSecretModal from './views/createSecretModal';
import * as accessLogButtonAction from './actions/accessLogButtonAction';
import * as revealButtonAction from './actions/revealButtonAction';
import * as handleSecretShortcut from './shortcuts/handleSecretShortcut';
import * as appHomeOpen from './views/appHomeOpen';
import * as appHomeSettingAction from './actions/appHomeSettingAction';

const registerListeners = (app: App) => {
    secretCommand.register(app);
    vaultCommand.register(app);
    createSecretModal.register(app);
    accessLogButtonAction.register(app);
    revealButtonAction.register(app);
    appHomeOpen.register(app);
    appHomeSettingAction.register(app);
    handleSecretShortcut.register(app);
};

export default registerListeners;
