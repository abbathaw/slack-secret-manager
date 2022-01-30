import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB({
    region: 'us-west-2',
    // endpoint: 'http://localhost:8000',
});

const backoffInterval = 2000; // 2 seconds

const isTableExists = async (TableName: string) => {
    try {
        const tableData = await dynamoDB.describeTable({ TableName }).promise();
        return tableData && tableData.Table;
    } catch (e) {
        return false;
    }
};

const waitForTable = async (TableName: string) => {
    try {
        const tableData = await dynamoDB.describeTable({ TableName }).promise();

        if (tableData!.Table!.TableStatus !== 'ACTIVE') {
            console.log(`Table status: ${tableData!.Table!.TableStatus}, retrying in ${backoffInterval}ms...`);
            return new Promise((resolve) => {
                setTimeout(() => waitForTable(TableName).then(resolve), backoffInterval);
            });
        } else {
            return;
        }
    } catch (error) {
        console.warn(`Table not found! Error below. Retrying in ${backoffInterval} ms...`, error);
        return new Promise((resolve) => {
            setTimeout(() => waitForTable(TableName).then(resolve), backoffInterval);
        });
    }
};

async function createTable(params: DynamoDB.CreateTableInput) {
    try {
        await dynamoDB.createTable(params).promise();
    } catch (e) {
        console.log('An error occurred while creating the table', e);
        throw new Error('Failed to create a table');
    }
}

const SecretTableParam: DynamoDB.CreateTableInput = {
    TableName: '',
    KeySchema: [{ AttributeName: 'uuid', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'uuid', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
};

const AccessLogTableParam: DynamoDB.CreateTableInput = {
    TableName: '',
    KeySchema: [{ AttributeName: 'uuid', KeyType: 'HASH' }],
    AttributeDefinitions: [
        { AttributeName: 'uuid', AttributeType: 'S' },
        { AttributeName: 'secretUuid', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'secretIdIndex',
            KeySchema: [
                {
                    AttributeName: 'secretUuid',
                    KeyType: 'HASH',
                },
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
        },
    ],
    BillingMode: 'PAY_PER_REQUEST',
};

const MessageTableParam: DynamoDB.CreateTableInput = {
    TableName: '',
    KeySchema: [
        { AttributeName: 'workspaceId', KeyType: 'HASH' },
        { AttributeName: 'uuid', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
        { AttributeName: 'workspaceId', AttributeType: 'S' },
        { AttributeName: 'uuid', AttributeType: 'S' },
        { AttributeName: 'channelId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'ChannelIndex',
            KeySchema: [
                {
                    AttributeName: 'workspaceId',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'channelId',
                    KeyType: 'RANGE',
                },
            ],
            Projection: {
                ProjectionType: 'ALL',
            },
        },
    ],
    BillingMode: 'PAY_PER_REQUEST',
};

const UserSettingsTableParam: DynamoDB.CreateTableInput = {
    TableName: '',
    KeySchema: [
        { AttributeName: 'workspaceId', KeyType: 'HASH' },
        { AttributeName: 'userId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
        { AttributeName: 'workspaceId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
};

const tables = [
    { name: 'Message', params: MessageTableParam },
    { name: 'Secret', params: SecretTableParam },
    { name: 'Access', params: AccessLogTableParam },
    { name: 'UserSettings', params: UserSettingsTableParam },
];

const createTablesIfNotExist = async () => {
    const createdTables = [];
    const existingTables = [];
    for (let index = 0; index < tables.length; index++) {
        const table = tables[index];
        if (await isTableExists(table.name)) {
            existingTables.push(table.name);
        } else {
            await createTable(Object.assign({}, table.params, { TableName: `${table.name}` }));
            await waitForTable(table.name);
            createdTables.push(table.name);
        }
    }
    console.log(`Created Tables ${createdTables}, Existing Tables ${existingTables}`);
};

createTablesIfNotExist().then(() => console.log('DB setup done'));
