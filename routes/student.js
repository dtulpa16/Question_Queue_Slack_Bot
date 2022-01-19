const Student = require("../models/student");
const express = require("express");
const router = express.Router();
const slackInteractiveMessages = require("@slack/interactive-messages");
const { qCardModal, postQ, removeFromQueue } = require("./helpers");
const botToken = require("../keys/keys")
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(
  botToken.botToken,
  {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
  }
);
let reqData = "";
let resData = "";
let tempQueue = []

router.post("/", async (req, res) => {
  reqData = req;
  resData = res;
  qCardModal(req, res);
});


//Interaction handler

router.post("/notify", async (req, res) => {
  try {
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);
    if (payload.type === "view_submission") {
      postQ(reqData, res, payload);
      return res.status(200).send("");
    } else if (payload.type === "interactive_message") {
      if (payload.actions[0].name === "zoom") {
        await client.chat.postMessage({
          response_type: "status",
          channel: "C02S3U4NPFT",
          text: payload.user.name + " // " + payload.original_message.text,
        });
        client.reactions.add({
          channel: payload.channel.id,
          name:"heavy_check_mark",
          timestamp:payload.message_ts
        })
      } else if (payload.actions[0].name === "slack") {
        await client.chat.postMessage({
          response_type: "status",
          channel: payload.actions[0].value,
          text: "Taking a look! :eyes:",
        });
        client.reactions.add({
          channel: payload.channel.id,
          name:"eyes",
          timestamp:payload.message_ts
        })
      } else if (payload.actions[0].name === "complete") {
        const messageId = payload.original_message.ts;
        // The ID of the channel that contains the message
        const channelId = payload.channel.id;
        try {
          // Call the chat.delete method using the WebClient
          const result = await client.chat.delete({
            channel: channelId,
            ts: messageId,
          });
          removeFromQueue(payload.original_message.text)
          console.log("");
        } catch (error) {
          console.error(error);
        }
      }
      else if (payload.actions[0].name === "resolved"){
        await client.reactions.add({
          channel: payload.channel.id,
          name:"white_check_mark",
          timestamp:payload.message_ts
        })
     
      }
    }

    return console.log('');
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
