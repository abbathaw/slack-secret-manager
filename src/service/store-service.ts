import { AccessLog, Message, Secret, UserSettings } from '../models';
import { calculateTTL } from '../utils';

const { v4: uuidv4 } = require('uuid');

const {Datastore} = require('@google-cloud/datastore');

const datastore = new Datastore();


interface ICreateSecret {
    workspaceId: string;
    authorId: string;
    channelId?: string;
    title: any;
    encrypted: any;
    users: any;
    expiry: number;
    onetime: boolean;
    conversation?: any;
}

async function createSecret({
    workspaceId,
    authorId,
    channelId,
    title,
    encrypted,
    users,
    expiry,
    onetime,
    conversation,
}: ICreateSecret) {
    try {
        const uuid = uuidv4();
        const expiryEpoch = calculateTTL(expiry);
        const messageItem: Message = {
            workspaceId,
            uuid,
            channelId,
            title,
            authorId,
            users,
            expiry: expiryEpoch,
            onetime,
            conversation,
            createdAt: new Date().toISOString(),
        };

        const secretItem: Secret = {
            uuid,
            encrypted,
            ttl: expiryEpoch,
        };

        await datastore
            .save({
                key: datastore.key(['Secret', uuid]),
                data: secretItem,
            });

        await datastore
            .save({
                key: datastore.key(['Workspace', workspaceId, 'Message', uuid]),
                data: messageItem,
            });
        return { uuid };
    } catch (err) {
        console.error(err);
        return undefined;
    }
}

export type SecretRetrievedType = {
    secret: Secret | undefined;
    message: Message | undefined;
    createdAt: Date;
};

async function retrieveSecret(uuid: string, workspaceId: string): Promise<SecretRetrievedType> {
    const secretKey = datastore.key(['Secret', uuid])
    const [secret] = await datastore.get(secretKey);

    const messageKey = datastore.key(['Workspace', workspaceId, 'Message', uuid])
    const [message] = await datastore.get(messageKey);
    const results: SecretRetrievedType = {
        createdAt: new Date(message?.createdAt),
        secret: (secret) || undefined,
        message: (message) || undefined,
    };
    return results;
}

interface ICreateAuditTrail {
    uuid: string;
    userId: string;
    valid?: boolean;
}

async function createAuditTrail({ uuid: secretUuid, userId, valid = true }: ICreateAuditTrail) {
    const uuid = uuidv4();

    const auditItem: AccessLog = {
        uuid,
        secretUuid,
        userId,
        valid,
        createdAt: new Date().toISOString(),
    };

    await datastore
        .save({
            key: datastore.key('Access'),
            data: auditItem,
        });
    return {};
}

async function retrieveAuditTrail(uuid: string) {
    const query = await datastore.createQuery('Access')
        .filter('secretUuid', '=', uuid).order('createdAt');
    const [accessLogs] = await datastore.runQuery(query);
    return accessLogs as AccessLog[];
}

async function deleteMessage(uuid: string) {
    return await datastore.delete(datastore.key(['Secret', uuid]));
}

async function listAllSecrets(teamId: string, channelId: string) {
    const query = datastore.createQuery('Message')
        .filter('workspaceId', '=', teamId)
        .filter('channelId', '=', channelId).order('createdAt');
    const [messages] =  await datastore.runQuery(query);
    return messages as Message[];
}

async function saveUserSettings({ workspaceId, userId, defaultExpiry, defaultOneTime, defaultTitle }: UserSettings) {
    const userSettingItem: UserSettings = {
        workspaceId,
        userId,
        defaultExpiry,
        defaultOneTime,
        defaultTitle,
    };

    await datastore
        .save({
            key: datastore.key(['UserSettings', userId, 'Workspace', workspaceId]),
            data: userSettingItem,
        });
    return {};
}

async function getUserSettings(workspaceId: string, userId: string) {
    const settingsKey = datastore.key(['UserSettings', userId, 'Workspace', workspaceId])
    const [settings] = await datastore.get(settingsKey);
    return settings ? (settings as UserSettings) : undefined;
}

export {
    createSecret,
    retrieveSecret,
    createAuditTrail,
    retrieveAuditTrail,
    deleteMessage,
    listAllSecrets,
    saveUserSettings,
    getUserSettings,
};
