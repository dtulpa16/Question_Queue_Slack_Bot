const Student = require("../models/student");
const express = require("express");
const router = express.Router();
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient("xoxb-2871309273444-2869273753251-JqNWTTZ2limLbXNAROssJ8N5", {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
  });



router.post("/", async (req, res) => {
  console.log(req.body);
  const channelId = 'C02RM992Y1H';

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      'channel': channelId,
      'text': (req.body.channel_name),
      "blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `Channel - *${req.body.channel_name}*`
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "Message: " + req.body.text,
				}
			]
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "In on Slack",
						"emoji": true
					}
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": "In on Zoom",
						"emoji": true
					}
				}
			]
		}
	]
      
    });

    console.log(result);
    return
  } catch (error) {
    console.error(error);
  }
  return
});

module.exports = router;
