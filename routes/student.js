const Student = require("../models/student");
const express = require("express");
const screenshots = require("../Images/screenshots");
const router = express.Router();
const slackInteractiveMessages = require("@slack/interactive-messages");
const {
  qCardModal,
  postQ,
  removeFromQueue,
  instructorComplete,
  studentComplete,
  completeStudentUpdates,
} = require("./helpers");
const botToken = require("../keys/keys");
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(botToken.botToken, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG,
});
let reqData = "";
let resData = "";
let tempQueue = [];

router.post("/", async (req, res) => {
  reqData = req;
  resData = res;
  console.log("OG Req: ", req.body);
  qCardModal(req, res);
});

//Interaction handler

router.post("/notify", async (req, res) => {
  try {
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);
    if (payload.type === "view_submission") {
      // let updatePost = await client.chat.postMessage({
      //   token:botToken.botToken,
      //   channel: "C0315TKH370",
      //   text: 'hi!'
      // });

      console.log("TEST SUBMIT", payload.view.blocks[4]);
      let channelData = payload.view.blocks[4].elements[0].text.split(" ");
      let postChan = { id: channelData[1], chanName: channelData[0] };

      postQ(postChan, res, payload);
      return res.status(200).send("");
    } else if (payload.type === "interactive_message") {
      if (payload.actions[0].name === "zoom") {
        try {
          //TODO Student Updates Channel
          let updatePost = await client.chat.postMessage({
            response_type: "status",
            channel: "C0314LFSMB4",
            text: payload.user.name + " // " + payload.original_message.text,
          });
          completeStudentUpdates(updatePost);
          await client.reactions.add({
            channel: payload.channel.id,
            name: "heavy_check_mark",
            timestamp: payload.message_ts,
          });
          return res.status(200).send("");
        } catch (error) {
          console.log(error);
        }
      } else if (payload.actions[0].name === "slack") {
        try {
          let inOnSlack = await client.chat.postMessage({
            channel: payload.actions[0].value,
            text: "Taking a look! :eyes:",
          });
          await client.reactions.add({
            channel: payload.channel.id,
            name: "eyes",
            timestamp: payload.message_ts,
          });
          //Reply to message with instructor who is in on slack
          await client.chat.postMessage({
            channel: payload.channel.id,
            thread_ts: payload.original_message.ts,
            text: `${payload.user.name} in on slack`,
          });
          return res.status(200).send("");
        } catch (error) {
          console.log(error);
        }
      } else if (payload.actions[0].name === "resolved") {
        try {
          let studentCompletion = await client.reactions.add({
            channel: payload.channel.id,
            name: "white_check_mark",
            timestamp: payload.message_ts,
          });
          console.log(studentCompletion);
          return res.status(200).send("")
        } catch (error) {
          console.log(error);
        }
        studentComplete(payload.actions[0].value);
      } else if (payload.actions[0].name === "screenshot") {
        try {
          let chosenFile =
            screenshots.screenshots[
              Math.floor(Math.random() * screenshots.screenshots.length)
            ];
          let screenshotRequest = await client.chat.postMessage({
            channel: payload.actions[0].value,
            blocks: [
              {
                type: "image",
                title: {
                  type: "plain_text",
                  text: "Screenshots please:)",
                  emoji: true,
                },
                image_url: chosenFile,
                alt_text: "screenshots please:)",
              },
            ],
          });
          console.log(screenshotRequest);
          return res.status(200).send("")
        } catch (error) {
          console.log(error);
        }
      }
    } else if (payload.type === "block_actions") {
      const messageId = payload.message.ts;

      const channelId = payload.channel.id;

      console.log("ts: ", messageId);
      console.log("channel: ", channelId);
      try {
        // Call the chat.delete method using the WebClient
        const result = await client.chat.delete({
          channel: channelId,
          ts: messageId,
        });
        instructorComplete(payload.message.text, payload.user.name);
        removeFromQueue(payload.message.text, {
          ts: payload.message.ts,
          user: payload.user.id,
        });

        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    return console.log("");
  } catch (error) {
    console.error(error);
  }
});

router.get("/auth", async (req, res) => {
  console.log(req);
  try {
    let authTok = await client.oauth.v2.access({
      code: req.query.code,
      client_id: botToken.clientId,
      client_secret: botToken.client_secret,
    });
    botToken.botToken = authTok.authed_user.access_token;
    console.log(authTok);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
