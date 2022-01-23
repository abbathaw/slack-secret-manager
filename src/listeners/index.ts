import {App} from "@slack/bolt";
import * as secretCommand from './commands/secret'
import * as createSecretModal from './views/createSecretModal';
import * as accessLogButtonAction from './actions/accessLogButtonAction';
import * as revealButtonAction from './actions/revealButtonAction';

const registerListeners = (app: App) => {
    secretCommand.register(app);
    createSecretModal.register(app);
    accessLogButtonAction.register(app);
    revealButtonAction.register(app);
}

export default registerListeners;