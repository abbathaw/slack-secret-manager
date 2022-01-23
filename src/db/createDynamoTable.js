const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000',
});
const dynamodb = new AWS.DynamoDB();

const Param1 = {
    TableName: '',
    KeySchema: [
        { AttributeName: 'uuid', KeyType: 'HASH' },  //Partition key
    ],
    AttributeDefinitions: [
        { AttributeName: 'uuid', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};

function callback(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
}

dynamodb.createTable(Object.assign({}, Param1, { TableName: "Secret" }), callback);
dynamodb.createTable(Object.assign({}, Param1, { TableName: "Message" }), callback);
dynamodb.createTable(Object.assign({}, Param1, { TableName: "Access" }), callback);
