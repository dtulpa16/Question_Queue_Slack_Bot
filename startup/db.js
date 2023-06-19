
const AWS = require("aws-sdk");

// Remember to configure the AWS region
AWS.config.update({ region: "us-east-1" });

const dynamoDb = new AWS.DynamoDB.DocumentClient();


exports.dynamoDb = dynamoDb

