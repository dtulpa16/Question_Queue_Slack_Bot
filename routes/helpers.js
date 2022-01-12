const slackInteractiveMessages = require("@slack/interactive-messages");
const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(
  "xoxb-2871309273444-2869273753251-Jp4UKNdMJxnPFDM5LdZ8dZF9",
  {
    logLevel: LogLevel.DEBUG,
  }
);

const qCardModal = async (data) => {
//   console.log(data);
  try {
    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: data.trigger_id,
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

    console.log(result.view.blocks);
  } catch (error) {
    console.error(error);
  }
};

exports.qCardModal = qCardModal;
