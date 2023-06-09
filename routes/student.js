const express = require("express");
const screenshots = require("../Images/screenshots");
const router = express.Router();
const { qCardModal } = require("./QuestionCardModal/questionCardModal");
const {
  addBotToChannel,
  handleInteractiveMessage,
  handleBlockActions,
  handleViewSubmission,
} = require("./InteractionHandlers/helpers");
const botToken = require("../keys/keys");
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(botToken.botToken, {
  logLevel: LogLevel.DEBUG,
});
const connectDB = require("../startup/db");

router.post("/", async (req, res) => {
  console.log("Original Req: ", req.body);
  if (
    req.body.channel_name.includes("_") === false ||
    req.body.channel_name.includes("immersive") ||
    req.body.channel_name.includes("queue")
  ) {
    await handleUserErr(req.body.channel_id, req.body.user_id);
    return res.status(200).send("");
  }
  if (req.body.text.length > 5) {
    await screenshots.showTime(req.body.text, req.body.channel_id, res);
  } else {
    await addBotToChannel(req.body.channel_id);
    return qCardModal(req, res, client);
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
      await handleViewSubmission(payload, res);
    } else if (payload.type === "interactive_message") {
      await handleInteractiveMessage(payload, res, chosenFile);
    } else if (payload.type === "block_actions") {
      await handleBlockActions(payload, res);
    }
    return res.status(200).send("");
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
