const Student = require("../models/student");
const express = require("express");
const router = express.Router();
const slackInteractiveMessages = require("@slack/interactive-messages");
const { qCardModal, postToInstructors } = require("./helpers");

const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(
  "xoxb-2871309273444-2869273753251-Jp4UKNdMJxnPFDM5LdZ8dZF9",
  {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
  }
);
let reqData = ''
let resData = ''

router.post("/", async (req, res) => {
  reqData = req
  resData = res
  qCardModal(req,res);
  
});

router.post("/notify", async (req, res) => {
  try {
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);
    if (payload.type === "view_submission"){
      postToInstructors(reqData,res)
      return res.status(200).send('')
    }
    else if (payload.actions[0].name === "zoom") {
      await client.chat.postMessage({
        response_type: "status",
        channel: "C02S3U4NPFT",
        text: payload.user.name + " // " + payload.original_message.text,
      });
    } else if (payload.actions[0].name === "slack") {
      await client.chat.postMessage({
        response_type: "status",
        channel: payload.actions[0].value,
        text: "Taking a look! :eyes:",
      });
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

        console.log(result);
      } catch (error) {
        console.error(error);
      } 
    }

    return;
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
