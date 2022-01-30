import { AccessLog, Message, Secret } from '../models';
import { calculateTTL } from '../utils';

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000',
});
const docClient = new AWS.DynamoDB.DocumentClient();

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
            ttl: expiryEpoch.toString(),
        };

        await docClient
            .put({
                TableName: 'Secret',
                Item: secretItem,
            })
            .promise();

        await docClient
            .put({
                TableName: 'Message',
                Item: messageItem,
            })
            .promise();
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
    const secret = await docClient
        .get({
            TableName: 'Secret',
            Key: { uuid },
        })
        .promise();

    const message = await docClient
        .get({
            TableName: 'Message',
            Key: { uuid, workspaceId },
        })
        .promise();

    const results: SecretRetrievedType = {
        createdAt: new Date(message.Item?.createdAt),
        secret: (secret && secret.Item) || undefined,
        message: (secret && message.Item) || undefined,
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

    await docClient
        .put({
            TableName: 'Access',
            Item: auditItem,
        })
        .promise();
    return {};
}

async function retrieveAuditTrail(uuid: string) {
    const params = {
        TableName: 'Access',
        IndexName: 'secretIdIndex',
        KeyConditionExpression: 'secretUuid = :s',
        ExpressionAttributeValues: { ':s': uuid },
    };
    const data = await docClient.query(params).promise();
    const Items = data.Items;
    return Items as AccessLog[];
}

async function deleteMessage(uuid: string) {
    const params = {
        TableName: 'Secret',
        Key: {
            uuid: uuid,
        },
    };
    return await docClient.delete(params).promise();
}

async function listAllSecrets(teamId: string, channelId: string) {
    const params = {
        TableName: 'Message',
        IndexName: 'ChannelIndex',
        KeyConditionExpression: 'workspaceId = :t and channelId = :c',
        ExpressionAttributeValues: { ':t': teamId, ':c': channelId },
    };
    const data = await docClient.query(params).promise();
    const Items = data.Items;
    return Items as Message[];
}

export { createSecret, retrieveSecret, createAuditTrail, retrieveAuditTrail, deleteMessage, listAllSecrets };
