const Student = require("../models/student");
const express = require("express");
const router = express.Router();
const slackInteractiveMessages = require("@slack/interactive-messages");

const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(
  "xoxb-2871309273444-2869273753251-Jp4UKNdMJxnPFDM5LdZ8dZF9",
  {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
  }
);

router.post("/", async (req, res) => {
  console.log(req.body);
  const channelId = "C02RM992Y1H";

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      response_type: "in_channel",
      channel: channelId,

      text: req.body.channel_name,
      attachments: [
        {
          text: "Message: " + req.body.text,
          callback_id: "ping:instructor",
          color: "#3AA3E3",
          actions: [
            {
              name: "slack",
              text: "In on Slack",
              type: "button",
              value: "ping:instructor",
            },
            {
              name: "zoom",
              text: "In on Zoom",
              type: "button",
              value: "zoom",
            },
            {
              name: "complete",
              text: "Completed",
              style: "primary",
              type: "button",
              value: "complete",
              confirm: {
                title: "Are you sure?",
                ok_text: "Yes",
                dismiss_text: "No",
              },
            },
          ],
        },
      ],
    });

    const studentResult = await client.chat.postMessage({
      response_type: "in_channel",
      channel: "C02RT1MT4S0",
      text: req.body.channel_name,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Channel - *${req.body.channel_name}*`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Message: " + req.body.text,
            },
          ],
        },
      ],
    });

    console.log(studentResult);
    return res.send("Your question has been added to the queue!");
  } catch (error) {
    console.error(error);
  }
});

router.post("/notify", async (req, res) => {
  try {
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);
    if (payload.actions[0].name === "zoom") {
      await client.chat.postMessage({
        response_type: 'status',
        channel: "C02S3U4NPFT",
        text: (payload.user.name) + " in with " + (payload.original_message.text),
      });
    }

    return;
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
