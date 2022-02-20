const slackInteractiveMessages = require("@slack/interactive-messages");
const screenshots = require("../Images/screenshots");
const {
  classQueue,
  GenQueue,
  InstructorQueue,
  StudentUpdateQueue,
} = require("../models/student");
const { App } = require("@slack/bolt");
const { WebClient, LogLevel } = require("@slack/web-api");
const botToken = require("../keys/keys");
const client = new WebClient(botToken.botToken, {
  logLevel: LogLevel.DEBUG,
});

const express = require("express");
const router = express.Router();
let originalReq = "";
const poloniumQueueChannel = "C0316V40MHA";
const astatineQueueChannel = "C0314KUTMK4";
const bismuthQueueChannel = "C030Q20U6MV";
const genQueueChannel = "C0311NA00SH";
const instructorQueue = "C0314K9LXQS";
let tempQueue = [];
let tempGenQueue = [];
let tempInstructotQueue = [];
let tempStudentUpdates = [];
let studentQTS = "";

const qCardModal = async (data, res) => {
  // originalReq = data;
  console.log("Modal Open");
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
              min_length: 51,
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

const postQ = async (req, res, payload) => {
  console.log("PostQ Function Hit");
  let studentName = req.chanName.split("_");
  let cohortStamp = "";
  if (studentName[1] === "bismuth") {
    cohortStamp = ":83-bi:";
  } else if (studentName[1] === "polonium") {
    cohortStamp = ":84-po:";
  } else if (studentName[1] === "astatine") {
    cohortStamp = ":85-at:";
  }else if (studentName[1] === "radon") {
    cohortStamp = ":86-rn:";
  }else if (studentName.length > 2 && studentName[3] === "radon") {
    cohortStamp = ":spider_web: :86-rn:";
  }else if (studentName.length > 2 && studentName[3] === "astatine") {
    cohortStamp = ":spider_web: :85-at:";
  }else if (studentName.length > 2 && studentName[3] === "radon") {
    cohortStamp = ":spider_web: :86-rn:";
  }

  try {
    console.log("Within Try request for post to student channel");
    let studentQCard = await client.chat.postMessage({
      token: botToken.botToken,
      channel: req.id,
      attachments: [
        {
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What is the task you are trying to accomplish? What is the goal?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: payload.view.state.values[1].my_action.value,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What do you think the problem or impediment is?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[2].my_action.value}`,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What have you specifically tried in your code?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[3].my_action.value}`,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What did you learn by dropping a breakpoint?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[4].my_action.value}`,
                emoji: true,
              },
            },
            {
              type: "actions",

              elements: [
                {
                  type: "button",

                  text: {
                    type: "plain_text",
                    text: "Resolved",

                    emoji: true,
                  },

                  value: req.chanName,
                  action_id: "resolved",
                },
              ],
            },
          ],
        },
      ],
    });
    studentQTS = studentQCard.message.ts;
    console.log("STUDENT CARD ", studentQCard);
  } catch (error) {
    console.log(error);
  }
  try {
    let SSRequest = await client.chat.postMessage({
      token: botToken.botToken,
      channel: req.id,
      text: "Screenshots Please :blobderpy:",
    });
    console.log(SSRequest);
  } catch (error) {
    console.log(error);
  }

  let cardLink = await client.chat.getPermalink({
    channel: req.id,
    message_ts: studentQTS,
  });

  try {
    let genQueue = await client.chat.postMessage({
      token: botToken.botToken,
      text: req.chanName,
      //TODO GEN queue channel
      channel: "C0334J191KN",
      attachments: [
        {
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${cohortStamp} ${req.chanName} ${cohortStamp}`,
              },
              accessory: {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Go To Card",
                  emoji: true,
                },
                value: "click_me_123",
                url: cardLink.permalink,
                action_id: "jump2card",
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What is the task you are trying to accomplish? What is the goal?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: payload.view.state.values[1].my_action.value,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What do you think the problem or impediment is?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[2].my_action.value}`,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What have you specifically tried in your code?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[3].my_action.value}`,
                emoji: true,
              },
            },
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "What did you learn by dropping a breakpoint?",
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "plain_text",
                text: `${payload.view.state.values[4].my_action.value}`,
                emoji: true,
              },
            },
          ],
        },
      ],
    });

    let enQueue = new GenQueue({
      name: genQueue.message.text,
      channel: genQueue.channel,
      ts: genQueue.ts,
    });
    enQueue.save();
    let nstructorQueue = new InstructorQueue({
      name: genQueue.message.text,
      channel: genQueue.channel,
      ts: genQueue.ts,
    });
    nstructorQueue.save();

    console.log("Gen queue", genQueue);
  } catch (error) {
    console.error(error);
  }

  try {
    const channelId = instructorQueue;
    const result = await client.chat.postMessage({
      token: botToken.botToken,
      response_type: "status",

      //TODO instructor channel
      channel: "C032VJSJUNS",
      text: `${req.chanName}`,
      blocks: [
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${cohortStamp} ${req.chanName} ${cohortStamp}`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Jump To Channel",
              emoji: true,
            },
            value: "click_me_123",
            url: cardLink.permalink,
            action_id: "jump2card",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Complete",
              },
              confirm: {
                title: {
                  type: "plain_text",
                  text: "Are you sure?",
                },
                text: {
                  type: "mrkdwn",
                  text: "Please confirm the question card has been resolved",
                },
                confirm: {
                  type: "plain_text",
                  text: "Confirm",
                },
                deny: {
                  type: "plain_text",
                  text: "Cancel",
                },
              },
              style: "primary",
              value: req.id,
            },
          ],
        },

        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "What is the task you are trying to accomplish? What is the goal?",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: payload.view.state.values[1].my_action.value,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "What do you think the problem or impediment is?",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: `${payload.view.state.values[2].my_action.value}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "What have you specifically tried in your code?",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: `${payload.view.state.values[3].my_action.value}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "What did you learn by dropping a breakpoint?",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: `${payload.view.state.values[4].my_action.value}`,
            emoji: true,
          },
        },
      ],
      attachments: [
        {
          text: " ",
          callback_id: "ping:instructor",
          color: "#3AA3E3",
          actions: [
            {
              name: "slack",
              text: "In on Slack",
              type: "button",
              value: req.id,
            },
            {
              name: "zoom",
              text: "In on Zoom",
              type: "button",
              value: req.id,
            },
            {
              name: "screenshot",
              text: "Request Screenshots",
              type: "button",
              value: req.id,
            },
          ],
        },
      ],
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }

  //General queue
  try {
    if (studentName[1] === "astatine") {
      let at = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO ASTATINE QUEUE channel
        channel: "C0334G1S1CL",
        text: req.chanName,
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
      let lassQueueSchema = new classQueue({
        name: at.message.text,
        channel: at.channel,
        ts: at.ts,
      });
      lassQueueSchema.save();
    } else if (studentName[1] === "polonium") {
      let po = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO POLONIUM QUEUE channel
        channel: "C032MKG3KP1",
        text: req.chanName,
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

      let lassQueueSchema = new classQueue({
        name: po.message.text,
        channel: po.channel,
        ts: po.ts,
      });
      lassQueueSchema.save();
    } else if (studentName[1] === "bismuth") {
      let bi = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO BISMUTH QUEUE channel
        channel: "C032MK92EJ3",
        text: req.chanName,
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

      let lassQueueSchema = new classQueue({
        name: bi.message.text,
        channel: bi.channel,
        ts: bi.ts,
      });
      lassQueueSchema.save();
    }else if (studentName[1] === "radon") {
      let rn = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO RADON QUEUE channel
        channel: "C034LGPMG5N",
        text: req.chanName,
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

      let lassQueueSchema = new classQueue({
        name: rn.message.text,
        channel: rn.channel,
        ts: rn.ts,
      });
      lassQueueSchema.save();
    } else if (studentName.length > 2 && studentName[3] === "astatine") {
      let wda = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO WEBDEV ASTATINE QUEUE channel
        channel: "C033WQ66J2E",
        text: req.chanName,
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

      let lassQueueSchema = new classQueue({
        name: wda.message.text,
        channel: wda.channel,
        ts: wda.ts,
      });
      lassQueueSchema.save();
    } else if (studentName.length > 2 && studentName[3] === "radon") {
      let wdr = await client.chat.postMessage({
        token: botToken.botToken,
        //TODO WEBDEV RADON QUEUE channel
        channel: "C033TT0RCBF",
        text: req.chanName,
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

      let lassQueueSchema = new classQueue({
        name: wdr.message.text,
        channel: wdr.channel,
        ts: wdr.ts,
      });
      lassQueueSchema.save();
    }

    console.log("");
  } catch (error) {
    console.error(error);
  }
};

const completeStudentUpdates = async (data) => {
  let name = data.message.text.split(" // ");

  let tudentUpdateQueue = new StudentUpdateQueue({
    name: name[1],
    channel: data.channel,
    ts: data.ts,
  });
  tudentUpdateQueue.save();
};

const removeFromQueue = async (data, messageData) => {
  let studentToDelete = await classQueue
    .find({ name: data }, function (err, obj) {
      console.log(obj);
    })
    .clone();

  console.log(
    "Query return in function that removes student from their class queue: ",
    studentToDelete
  );
  try {
    let deleteStudent = await client.chat.delete({
      channel: studentToDelete[0].channel,
      ts: studentToDelete[0].ts,
    });
    console.log(deleteStudent);
  } catch (error) {
    console.log(error);
    try {
      let errorReply = await client.chat.postMessage({
        channel: "U02JSDX1JBV",
        text: `An error occurred trying to remove ${data} from their class queue. Please manually remove them from the queue & mark their question as complete in the Q card archive channel`,
      });
      console.log(errorReply);
    } catch (error) {
      console.log(error);
    }
  }
  await classQueue.deleteOne({ name: data });
};

const studentComplete = async (data) => {
  let cardTocomplete = await GenQueue.find({ name: data }, function (err, obj) {
    console.log(obj);
  }).clone();
  console.log(
    "gen queue card to be marked from mongo return(student resolution)",
    cardTocomplete
  );

  try {
    let replyResolution = await client.chat.postMessage({
      channel: cardTocomplete[0].channel,
      thread_ts: cardTocomplete[0].ts,
      text: "Resolved in student channel",
    });
    await client.reactions.add({
      channel: cardTocomplete[0].channel,
      name: "white_check_mark",
      timestamp: cardTocomplete[0].ts,
    });
    console.log(replyResolution);
  } catch (error) {
    console.log(error);
    try {
      let errorReply = await client.chat.postMessage({
        channel: "U02JSDX1JBV",
        text: `An error occurred. A Q card was marked as "complete" by student: ${cardTocomplete[0].name}. Check there channel + Gen Queue to ensure no error`,
      });
      console.log(errorReply);
    } catch (error) {
      console.log(error);
    }
  }
  await GenQueue.deleteOne({ name: data });
};

const instructorComplete = async (data, resolver) => {
  let cardTocomplete = await InstructorQueue.find(
    { name: data },
    function (err, obj) {
      console.log(obj);
    }
  ).clone();
  console.log(
    "query return in function that marks card as complete in archive(instructor resolution): ",
    cardTocomplete
  );

  try {
    let archiveMark = await client.reactions.add({
      response_type: "status",
      channel: cardTocomplete[0].channel,
      name: "ballot_box_with_check",
      timestamp: cardTocomplete[0].ts,
    });
    console.log(archiveMark);
  } catch (error) {
    console.log("Error in marking archive card : ", error);
  }
  try {
    let instructorResolution = await client.chat.postMessage({
      response_type: "status",
      channel: cardTocomplete[0].channel,
      thread_ts: cardTocomplete[0].ts,
      text: `Resolved from instructor channel by ${resolver}`,
    });
    console.log(instructorResolution);
  } catch (error) {
    console.log(error);
    try {
      let errorReply = await client.chat.postMessage({
        channel: "U02JSDX1JBV",
        text: `An error occurred. A Q card was marked as "complete" by instructor in instructor queue. Check Gen queue to ensure it has been marked as Complete by instructor`,
      });
      console.log(errorReply);
    } catch (error) {
      console.log(error);
    }
  }
  await InstructorQueue.deleteOne({ name: data });

  //TODO This filter is used to udpate the student updates channel(sends "back" emoji)
  let updateToUpdate = await StudentUpdateQueue.find(
    { name: data },
    function (err, obj) {
      console.log(obj);
    }
  ).clone();
  console.log("query return for student update query: ", updateToUpdate);
  try {
    let updateZoomStatus = await client.reactions.add({
      response_type: "status",
      channel: updateToUpdate[0].channel,
      name: "back",
      timestamp: updateToUpdate[0].ts,
    });
    await StudentUpdateQueue.deleteOne({ name: data });
    console.log(updateZoomStatus);
  } catch (error) {
    console.log(error);
  }
};

exports.completeStudentUpdates = completeStudentUpdates;
exports.removeFromQueue = removeFromQueue;
exports.qCardModal = qCardModal;
exports.postQ = postQ;
exports.studentComplete = studentComplete;
exports.instructorComplete = instructorComplete;
