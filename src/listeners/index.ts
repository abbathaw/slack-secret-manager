import { App } from '@slack/bolt';
import * as secretCommand from './commands/secret';
import * as vaultCommand from './commands/vault';
import * as createSecretModal from './views/createSecretModal';
import * as accessLogButtonAction from './actions/accessLogButtonAction';
import * as revealButtonAction from './actions/revealButtonAction';
import * as listenToNewBotMessages from './message/createdSecret';

const registerListeners = (app: App) => {
    secretCommand.register(app);
    vaultCommand.register(app);
    createSecretModal.register(app);
    accessLogButtonAction.register(app);
    revealButtonAction.register(app);
    listenToNewBotMessages.register(app);
};

export default registerListeners;
