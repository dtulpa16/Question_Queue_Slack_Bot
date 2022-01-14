const slackInteractiveMessages = require("@slack/interactive-messages");
const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");
const botToken = require("../keys/keys")
const client = new WebClient(
  botToken.botToken,
  {
    logLevel: LogLevel.DEBUG,
  }
);
let originalReq = "";
const oxygenQueueChannel = "C02U02XA55J";
const hydrogenQueueChannel = "C02TXPC0TQS";
let tempQueue = []
const qCardModal = async (data, res) => {
  originalReq = data;

  try {
    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: data.body.trigger_id,

      response_action: "clear",
      view: {
        type: "modal",
        callback_id: "gratitude-modal",
        title: {
          type: "plain_text",
          text: "Question Card",
          emoji: true,
        },
        submit: {
          type: "plain_text",
          text: "Submit",
          emoji: true,
        },
        close: {
          type: "plain_text",
          text: "Cancel",
          emoji: true,
        },
        blocks: [
          {
            type: "input",
            block_id: "1",
            element: {
              type: "plain_text_input",
              action_id: "my_action",
            },
            label: {
              type: "plain_text",
              text: "What is the task you are trying to accomplish? What is the goal?",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "2",
            element: {
              type: "plain_text_input",
              action_id: "my_action",
            },
            label: {
              type: "plain_text",
              text: "What do you think the problem or impediment is?",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "3",
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: "my_action",
            },
            label: {
              type: "plain_text",
              text: "What have you specifically tried in your code?",
              emoji: true,
            },
          },
          {
            type: "input",
            block_id: "4",
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: "my_action",
            },
            label: {
              type: "plain_text",
              text: "What did you learn by dropping a breakpoint?",
              emoji: true,
            },
          },
        ],
      },
    });
    return res.status(200).send("");
  } catch (error) {
    console.error(error);
  }
};

const postQ = async (req, res, payload) => {
  try {
    const channelId = "C02RM992Y1H";
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      response_type: "in_channel",
      channel: channelId,

      text: "Channel: " + req.body.channel_name,
      attachments: [
        {
          text: "Queued by: " + req.body.user_name,
        },
        {
          text: `Q Card:
          What is the task you are trying to accomplish? What is the goal? \n
          *${payload.view.state.values[1].my_action.value}* \n
          What do you think the problem or impediment is? \n
          *${payload.view.state.values[2].my_action.value}*\n
          What have you specifically tried in your code? \n
          *${payload.view.state.values[3].my_action.value}*\n
          What did you learn by dropping a breakpoint? \n
          *${payload.view.state.values[4].my_action.value}*\n`,
          callback_id: "ping:instructor",
          color: "#3AA3E3",
          actions: [
            {
              name: "slack",
              text: "In on Slack",
              type: "button",
              value: req.body.channel_id,
            },
            {
              name: "zoom",
              text: "In on Zoom",
              type: "button",
              value: req.body.channel_id,
            },
            {
              name: "complete",
              text: "Completed",
              style: "primary",
              type: "button",
              value: "complete",
            },
          ],
        },
      ],
    });

    let studentName = req.body.channel_name.split("_");

    await client.chat.postMessage({
      response_type: "in_channel",
      channel: "C02RT1MT4S0",
      text: req.body.channel_name,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${studentName[0]}*`,
          },
        },
      ],
    });
    if (studentName[1] === "hydrogen") {
      let hydro = await client.chat.postMessage({
        response_type: "in_channel",
        channel: hydrogenQueueChannel,
        text: req.body.channel_name,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${studentName[0]}*`,
            },
          },
        ],
      });
      tempQueue.push(hydro.ts)
    } else if (studentName[1] === "oxygen") {
      await client.chat.postMessage({
        response_type: "in_channel",
        channel: hydrogenQueueChannel,
        text: req.body.channel_name,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${studentName[0]}*`,
            },
          },
        ],
      });
    }

    await client.chat.postMessage({
      response_type: "in_channel",
      channel: originalReq.body.channel_id,
      attachments: [
        {
          text: `Q Card:
          What is the task you are trying to accomplish? What is the goal? \n
          *${payload.view.state.values[1].my_action.value}* \n
          What do you think the problem or impediment is? \n
          *${payload.view.state.values[2].my_action.value}*\n
          What have you specifically tried in your code? \n
          *${payload.view.state.values[3].my_action.value}*\n
          What did you learn by dropping a breakpoint? \n
          *${payload.view.state.values[4].my_action.value}*\n`,
          callback_id: "ping:instructor",
          color: "#3AA3E3",
          actions: [
            {
              name: "resolved",
              text: "Resolved",
              type: "button",
              value: req.body.channel_id,
            },
          ],
        },
      ],
    });

    return res.send("Question added to queue!");
  } catch (error) {
    console.error(error);
  }
};



exports.qCardModal = qCardModal;
exports.postQ = postQ;
