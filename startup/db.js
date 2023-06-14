const mongoose = require("mongoose");
const config = require("config");
const AWS = require("aws-sdk");

// Remember to configure the AWS region
AWS.config.update({ region: "us-east-1" });

const dynamoDb = new AWS.DynamoDB.DocumentClient();
function connectDB() {
  mongoose
    .connect(config.get("mongoURI"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.log(`Could not connect to MongoDB. ERROR: ${err}`);
      process.exit(1);
    });
}

exports.connectDB = connectDB
exports.dynamoDb = dynamoDb

