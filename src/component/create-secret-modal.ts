import {WebClient} from "@slack/web-api/dist/WebClient";
import {SlackAction} from "@slack/bolt";
import {SlashCommand} from "@slack/bolt/dist/types/command";

interface CreateSecretModalInterface {
    client: WebClient;
    body: any;
    command: SlashCommand;
}

const showCreateSecretModal = async ({ command, client, body }: CreateSecretModalInterface) => {
    const result = await client.views.open({
        // Pass a valid trigger_id within 3 seconds of receiving it
        // @ts-ignore // TODO check if this is correct
        trigger_id: body.trigger_id,
        // View payload
        view: {
            type: 'modal',
            // View identifier
            callback_id: 'modal-create-secret',
            private_metadata: JSON.stringify({
                channel_id: command.channel_id,
                response_url: command.response_url,
            }),
            title: {
                type: 'plain_text',
                text: 'Share Secret'
            },
            blocks: [
                {
                    type: 'input',
                    optional: true,
                    element: {
                        type: 'plain_text_input',
                        action_id: 'action-title'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Title',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    optional: true,
                    element: {
                        type: 'plain_text_input',
                        multiline: true,
                        action_id: 'action-message',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Message to encrypt and share'
                        }
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Secret Message'
                    }
                },
                {
                    type: 'input',
                    optional: true,
                    element: {
                        type: 'multi_users_select',
                        placeholder: {
                            type: 'plain_text',
                            text: 'Select users',
                            emoji: true
                        },
                        action_id: 'action-user'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Authorize User',
                        emoji: true
                    }
                },
                {
                    type: 'input',
                    optional: true,
                    element: {
                        type: 'static_select',
                        options: [
                            {
                                text: {
                                    type: 'plain_text',
                                    text: '1 hour',
                                    emoji: true
                                },
                                value: '3600'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: '1 day',
                                    emoji: true
                                },
                                value: '86400'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: '1 week',
                                    emoji: true
                                },
                                value: '604800'
                            },
                            {
                                text: {
                                    type: 'plain_text',
                                    text: 'Forever',
                                    emoji: true
                                },
                                value: '0'
                            }
                        ],
                        action_id: 'action-expiry'
                    },
                    label: {
                        type: 'plain_text',
                        text: 'Expiry Option',
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ' '
                    },
                    accessory: {
                        type: 'checkboxes',
                        options: [
                            {
                                text: {
                                    type: 'mrkdwn',
                                    text: 'One-time visible'
                                },
                                value: 'one-time'
                            }
                        ],
                        action_id: 'action-visible'
                    }
                }
            ],
            submit: {
                type: 'plain_text',
                text: 'Submit'
            }
        }
    });
    return result;
}

export {showCreateSecretModal}