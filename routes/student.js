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
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  logLevel: LogLevel.DEBUG,
});

/**
 * @description Handles the submission of the /queue command
 */
router.post("/", async (req, res) => {
  console.log("Original Req: ", req.body);
  //Checks if message came from the student's channel. Ends request if not sent from valid channel
  if (
    req.body.channel_name.includes("_") === false ||
    req.body.channel_name.includes("immersive") ||
    req.body.channel_name.includes("queue")
  ) {
    await handleUserErr(req.body.channel_id, req.body.user_id);
    return res.status(200).send("");
  }
  if (req.body.text.length > 5) {
    await screenshots.showTime(req.body.text, req.body.channel_id, res, client);
  } else {
    //Trys adding bot to the channel the command was sent in. (Bot needs to be in channel in order to use it)
    await addBotToChannel(req.body.channel_id);
    //Calls function that will trigger modal to open
    return qCardModal(req, res, client);
  }
});
/**
 * @param {string} chanId Channel Id where command was entered
 * @param {string} userId ID of user who sent in the command + who will see ephemeral message
 * @returns 200 status code which ends request
 */
const handleUserErr = async (chanId, userId) => {
  try {
    // Posts ephemeral message telling them they used the command in the wrong channel
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

/**
 * @description Handles all Slack interactions (modal being submitted, interaction with question card)
 */
router.post("/notify", async (req, res) => {
  // Logging incoming modal
  console.log("Modal sent");

  // Randomly choose a screenshot for the "request screenshot" button
  let chosenFile =
    screenshots.screenshots[
      Math.floor(Math.random() * screenshots.screenshots.length)
    ];

  try {
    // Parsing the incoming payload from Slack
    let payload = JSON.parse(req.body.payload);
    console.log("payload ", payload);

    // Check if the payload type is a view submission (i.e., modal submission)
    if (payload.type === "view_submission") {
      // Handle the view submission and return a successful response
      await handleViewSubmission(payload, res);
      return res.status(200).send("");
    }

    // Check if the payload type is an interactive message
    // (i.e., interactions with "In on Slack/Zoom" and "Request Screenshots" buttons)
    else if (payload.type === "interactive_message") {
      // Handle the interactive message
      await handleInteractiveMessage(payload, res, chosenFile);
    }

    // Check if the payload type is block actions (i.e., instructor actions like "Jump 2 Card" or completing a question card)
    else if (payload.type === "block_actions") {
      // Handle the block actions
      await handleBlockActions(payload, res);
    }

    // If none of the above, return a successful response
    return res.status(200).send("");
  } catch (error) {
    // Log any errors
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
      client_id: process.env.SLACK_BOT_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET_KEY,
    });
    let authedUser = authTok.authed_user.access_token;
    console.log("AUTH TOKEN RESPONSE: ", authTok);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
