const { StatTrack } = require("../../models/student");

const { connectDB, dynamoDb } = require("../../startup/db");

const qCardModal = async (data, res, client) => {
  connectDB();
  let incrementTest = await StatTrack.findById("6226593c04cb291c5cda53a5");
  incrementTest.QCardOpen++;
  incrementTest.save();
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
              multiline: true,
              min_length: 50,
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
              multiline: true,
              action_id: "my_action",
              min_length: 50,
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
              min_length: 50,
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
              min_length: 2,
            },
            label: {
              type: "plain_text",
              text: "What did you learn by dropping a breakpoint?",
              emoji: true,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",

                text: data.body.channel_name + " " + data.body.channel_id,
              },
            ],
          },
        ],
      },
    });

    return res.status(200).send("");
  } catch (error) {
    console.error(error);
  }
};
exports.qCardModal = qCardModal;
