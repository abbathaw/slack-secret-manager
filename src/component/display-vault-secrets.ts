import { combinedMHType } from '../models';

export const getVaultBlocks = (messageAndHistory: combinedMHType[]) => {
    const blocks: any = [];
    messageAndHistory.forEach((messageH) => {});
    return blocks;
};

export const getVaultBlock = (messageH: combinedMHType) => {
    const blocks: any = [];
    const firstSection = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `<@${messageH.authorId}> shared a secret *${messageH.title || '<Untitled Secret>'}*`,
        },
    };
    const actionSection = {
        type: 'actions',
        block_id: 'actionblock-secret',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Reveal Secret',
                },
                value: `${messageH.uuid}:${messageH.decodeKey}`,
                action_id: 'button-reveal',
            },
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: 'Access Log',
                },
                value: `${messageH.uuid}`,
                action_id: 'button-access-log',
            },
        ],
    };
    blocks.push(firstSection);
    blocks.push(actionSection);
    return blocks;
};
