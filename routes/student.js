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
  addBotToChannel
} = require("./helpers");
const botToken = require("../keys/keys");
const { StatTrack } = require("../models/student");
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(botToken.botToken, {
  logLevel: LogLevel.DEBUG,
});
const connectDB = require("../startup/db");

router.post("/", async (req, res) => {
  console.log("Original Req: ", req.body);
  if (req.body.channel_name.includes("_") === false) {
    await handleUserErr(req.body.channel_id, req.body.user_id);
    return res.status(200).send("");
  }
  if (req.body.text.length > 5) {
    await screenshots.showTime(req.body.text, req.body.channel_id, res);
  } else {
    await addBotToChannel(req.body.channel_id)
    return qCardModal(req, res);
  }
});

const handleUserErr = async (chanId, userId) => {
  try {
    // Call the chat.postEphemeral method using the WebClient
    const result = await client.chat.postEphemeral({
      channel: chanId,
      user: userId,
      text: "Whoops!! Wrong channel. Please only use the /queue in your instructor channel",
    });

    console.log(result);
    return res.status(200).send("");
  } catch (error) {
    console.error(error);
  }
};
//Interaction handler

router.post("/notify", async (req, res) => {
  console.log("Modal sent");
  connectDB();
  let chosenFile =
    screenshots.screenshots[
      Math.floor(Math.random() * screenshots.screenshots.length)
    ];
  try {
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);
    if (payload.type === "view_submission") {
      console.log("TEST SUBMIT", payload.view.blocks[4]);
      let channelData = payload.view.blocks[4].elements[0].text.split(" ");
      let postChan = { id: channelData[1], chanName: channelData[0] };

      try {
        if (
          payload.view.state.values[1].my_action.value.includes(".........") ||
          payload.view.state.values[2].my_action.value.includes("......")
        ) {
          await client.chat.postMessage({
            channel: postChan.id,
            text: "`An error has occurred while attempting to post Q card. Please limit number of periods in text fields`",
          });
          return res.status(200).send("");
        }
      } catch (error) {
        console.log("Additional detail request: ", error);
      }

      if (postChan.chanName.includes("_")) {
        await postQ(postChan, res, payload);
        return res.status(200).send("");
      } else {
        return res.status(200).send("");
      }
    } else if (payload.type === "interactive_message") {
      if (payload.actions[0].name === "zoom") {
        try {
          //TODO Student Updates Channel
          let updatePost = await client.chat.postMessage({
            response_type: "status",
            channel: "GNE49MV4M",
            text: payload.user.name + " // " + payload.original_message.text,
          });
          await completeStudentUpdates(updatePost);
          await client.reactions.add({
            channel: payload.channel.id,
            name: "heavy_check_mark",
            timestamp: payload.message_ts,
          });
          await client.chat.postMessage({
            channel: payload.actions[0].value,
            text: ":heavy_check_mark:",
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
          let replyThread = await client.chat.postMessage({
            channel: payload.channel.id,
            thread_ts: payload.original_message.ts,
            text: `${payload.user.name} in on slack`,
          });
          console.log("REPLY THREAD: ", replyThread);
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
          return res.status(200).send("");
        } catch (error) {
          console.log(error);
        }
        await studentComplete(payload.actions[0].value);
      } else if (payload.actions[0].name === "screenshot") {
        try {
          let screenshotRequest = await client.chat.postMessage({
            response_type: "status",
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
          return res.status(200).send("");
        } catch (error) {
          console.log(error);
        }
      }
    } else if (payload.type === "block_actions") {
      if (payload.actions[0].action_id == "jump2card") {
        console.log(" ");
      } else if (payload.actions[0].action_id == "resolved") {
        try {
          await studentComplete(payload.actions[0].value);
          let studentCompletion = await client.reactions.add({
            channel: payload.channel.id,
            name: "white_check_mark",
            timestamp: payload.message.ts,
          });

          return res.status(200).send("");
        } catch (error) {
          console.log(error);
        }
      } else {
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
          console.log("Message deleted from Instructor queue", result);
        } catch (error) {
          console.log(error);
        }
        try {
          // Call the chat.delete method using the WebClient
          const replyToDelete = await client.chat.delete({
            channel: channelId,
            ts: payload.message.latest_reply,
          });
          console.log("Reply deleted from Instructor queue", replyToDelete);
        } catch (error) {
          console.log(error);
        }
        try {
          await instructorComplete(payload.message.text, payload.user.name);
        } catch (error) {
          console.log(error);
          console.log(
            "Error occurred trying to mark card as complete in archive channel. Error note added 16FEB22"
          );
        }
        try {
          let queueRemoval = await removeFromQueue(payload.message.text, {
            ts: payload.message.ts,
            user: payload.user.id,
          });
          console.log(queueRemoval);
        } catch (error) {
          console.log(error);
          console.log(
            "Error occurred trying to remove student from queue. Error note added 16FEB22"
          );
        }
      }
    }

    return console.log("");
  } catch (error) {
    console.log(error);
  }
});

router.get("/auth", async (req, res) => {
  try {
    console.log("REQUEST IN AUTH ", req);
    console.log("CODE ", req.query.code);

    console.log(req);
    let authTok = await client.oauth.v2.access({
      code: req.query.code,
      client_id: botToken.clientId,
      client_secret: botToken.client_secret,
    });
    botToken.botToken = authTok.authed_user.access_token;
    console.log("AUTH TOKEN RESPONSE: ", authTok);
  } catch (error) {
    console.log(error);
  }
  
});

module.exports = router;
