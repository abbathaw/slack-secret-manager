import { App } from '@slack/bolt';
import { listAllSecrets } from '../../service/store-service';
import * as utils from '../../utils';
import { combinedMHType } from '../../models';
import { getVaultBlock } from '../../component/display-vault-secrets';

const register = (app: App) => {
    app.command('/vault', async ({ command, ack, respond, body, client }) => {
        await ack();

        try {
            const messages = await listAllSecrets(command.team_id, command.channel_id);
            const currentUser = command.user_id;
            const listOfMessages = messages.filter((message) => {
                return utils.isValidExpiry(message.expiry) && utils.isValidUser(message, currentUser);
            });

            if (listOfMessages.length > 0) {
                // get all history in channel bcz decode keys are in those messages
                const history = await client.conversations.history({ channel: command.channel_id });

                const filteredHistory =
                    history &&
                    history.messages &&
                    history.messages
                        .filter((h) => {
                            return h.subtype && h.subtype === 'bot_message' && h.bot_id;
                        })
                        .map((h) => {
                            return h.blocks
                                ?.filter((blocks) => {
                                    return blocks.block_id === 'actionblock-secret';
                                })
                                .map((blockElements) => {
                                    return blockElements.elements
                                        ?.filter((element) => {
                                            return element.action_id === 'button-reveal';
                                        })
                                        .map((targetElement) => {
                                            return targetElement.value;
                                        });
                                });
                        })
                        .flat(3);

                type accType = {
                    [key: string]: {
                        decodeKey: string;
                    };
                };
                const filteredHistoryParsed = filteredHistory?.reduce<accType>((acc, f: string | undefined) => {
                    const splitArray = f?.split(':');
                    if (splitArray) {
                        acc[splitArray[0]] = {
                            decodeKey: splitArray[1],
                        };
                    }
                    return acc;
                }, {});

                const combinedMessagesWithHistory = listOfMessages.reduce<combinedMHType[]>((acc, message) => {
                    const itemFromHistory = filteredHistoryParsed && filteredHistoryParsed[message.uuid];
                    const decodeKeyI: string = itemFromHistory ? itemFromHistory.decodeKey : '';
                    if (decodeKeyI) {
                        acc.push({ ...message, decodeKey: decodeKeyI });
                    }
                    return acc;
                }, []);

                for (let i = 0; i < combinedMessagesWithHistory.length; i++) {
                    const getResponseBlock = getVaultBlock(combinedMessagesWithHistory[i]);
                    await client.chat.postEphemeral({
                        text: `Listing ${i + 1} out of ${combinedMessagesWithHistory.length} secret`,
                        blocks: getResponseBlock,
                        channel: command.channel_id,
                        user: command.user_id,
                    });
                }
            } else {
                await respond({
                    response_type: 'ephemeral',
                    text: `There are no non-expired secrets shared here.`,
                    replace_original: false,
                });
            }
        } catch (e: any) {
            console.log('ERROR', e);
            if (e?.data?.error === 'not_in_channel') {
                await respond({
                    response_type: 'ephemeral',
                    text: `Please add Secret Manager App to this channel, so it can fetch this channel's vault.`,
                    replace_original: false,
                });
            } else {
                await respond({
                    response_type: 'ephemeral',
                    text: `Something happened while fetching your secrets. Please try again.`,
                    replace_original: false,
                });
            }
        }
    });
};

export { register };
