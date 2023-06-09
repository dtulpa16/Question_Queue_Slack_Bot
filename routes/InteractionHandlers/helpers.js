const {
  classQueue,
  GenQueue,
  InstructorQueue,
  StudentUpdateQueue,
  StatTrack,
} = require("../../models/student");
const { WebClient, LogLevel } = require("@slack/web-api");
const botToken = require("../../keys/keys");
const client = new WebClient(botToken.botToken, {
  logLevel: LogLevel.DEBUG,
});
const instructorQueue = "C0314K9LXQS";
let cohortStampsMap = {
  oganesson: ":118-og:",
  apus: ":stars:",
  seaborgium: ":106-sq:",
  aries: ":ram:",
};
let classQueueChannels = {
  oganesson: "C04NWRCSHBR",
  aries: "C058YG3G144",
  apus: "C050ETWCUR1",
  seaborgium: "C04330EM5R6",
};

let studentQTS = "";


//Handles posting question card to appropriate channels & adding database entries of message data
const postQ = async (req, res, payload) => {
  try {
    let incrementTest = await StatTrack.findById("6226593c04cb291c5cda53a5");
    incrementTest.QCardSent++;
    incrementTest.save();
  } catch (error) {
    console.log("QCard Sent Error (Mongo)", error);
  }

  //Check if question card came from from a flex channel by seeing if studentName[1] is an integer without the dashes (-).
  //Ex: studentName[1] from a flex channel will be something like "12-12-2023".
  let { cohortStamp, studentName } = await getQCardCohortEmoji(req, res);

  //Sends Q card details to student's channel
  studentQTS = await sendQCardToStudentChannel(req, payload);

  //Gets hyperlink to card. Will be used for "Jump 2 card" button
  let cardLink = await client.chat.getPermalink({
    channel: req.id,
    message_ts: studentQTS,
  });

  //Sends Card to Question Queue Archive channel & saves message data to be used when an instructor marks a card as "Complete"
  await sendQCardToArchiveChannel(req, payload, cohortStamp, cardLink, res);

  //Sends card to Question Queue channel for instructors to see
  await sendQCardToInstructorChannel(req, res, cohortStamp, cardLink, payload);

  //Adds studentName to their class queue channel
  let queueChannelId = classQueueChannels[studentName[1]];
  await postToClassQueue(req, res, queueChannelId, studentName);
};
const getQCardCohortEmoji = async (req, res) => {
  let studentName = req.chanName.split("_");

  //Check if question card came from from a flex channel by seeing if studentName[1] is an integer without the dashes (-).
  //Ex: studentName[1] from a flex channel will be something like "12-12-2023".
  try {
    if (/^\d+$/.test(studentName[1]?.split("-").join(""))) {
      return { cohortStamp: ":muscle:", studentName: studentName };
    } else if (cohortStampsMap[studentName[1]]) {
      // Find the cohortStamp using the cohortStampsMap
      return {
        cohortStamp: cohortStampsMap[studentName[1]],
        studentName: studentName,
      };
    } else {
      return { cohortStamp: ":qq:", studentName: studentName };
    }
  } catch (er) {
    console.log(er);
    return { cohortStamp: ":qq:", studentName: studentName };
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
  if (/^\d+$/.test(data.split("_")[1].split("-")?.join(""))) {
    console.log("No deletion required. Question card came from Flex Student");
    return;
  }
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
const sendQCardToInstructorChannel = async (
  req,
  res,
  cohortStamp,
  cardLink,
  payload
) => {
  try {
    const channelId = instructorQueue;
    const result = await client.chat.postMessage({
      token: botToken.botToken,
      response_type: "status",
      //! If cohortStamp is the "muscle" emoji, question card will get sent to Flex Question Queue
      channel: cohortStamp !== ":muscle:" ? "C032VJSJUNS" : "C04L9SCGGM7",
      // channel: cohortStamp !== ":muscle:" ? "C032VJSJUNS" : "C04GQT4TP2M",
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
};
const sendQCardToArchiveChannel = async (
  req,
  payload,
  cohortStamp,
  cardLink,
  res
) => {
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
};

const sendQCardToStudentChannel = async (req, payload) => {
  let questionCardTimeStamp;
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
    await client.chat.postMessage({
      token: botToken.botToken,
      channel: req.id,
      text: "Screenshots Please :blobderpy:",
    });
    questionCardTimeStamp = studentQCard.message.ts;
    console.log("STUDENT CARD ", studentQCard);
    return questionCardTimeStamp;
  } catch (error) {
    console.log(error);
  }
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
  try {
    let updateToUpdate = await StudentUpdateQueue.find(
      { name: data },
      function (err, obj) {
        console.log(obj);
      }
    ).clone();
    let updateZoomStatus = await client.reactions.add({
      response_type: "status",
      channel: updateToUpdate[0].channel,
      name: "back",
      timestamp: updateToUpdate[0].ts,
    });
    await StudentUpdateQueue.deleteOne({ name: data });
  } catch (error) {
    console.log(error);
  }
};

const addBotToChannel = async (chanId) => {
  try {
    const result = await client.conversations.invite({
      token: botToken.authToken,
      channel: `${chanId}`,
      users: `U031EDDN62Y`,
    });
  } catch (error) {
    console.log("Bot already in channel");
  }
};
const postToClassQueue = async (req, res, channelId, studentName) => {
  let response = await client.chat.postMessage({
    token: botToken.botToken,
    channel: channelId,
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

  let classQueueSchema = new classQueue({
    name: response.message.text,
    channel: response.channel,
    ts: response.ts,
  });

  classQueueSchema.save();
};
// Function to handle "interactive_message" type payloads
async function handleInteractiveMessage(payload, res, chosenFile) {
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
}

// Function to handle "block_actions" type payloads (instructors interacting with Q Cards)
async function handleBlockActions(payload, res) {
  if (payload.actions[0].action_id == "jump2card") {
    console.log(" ");
  } else if (payload.actions[0].action_id == "resolved") {
    try {
      await studentComplete(payload.actions[0].value);
      await client.reactions.add({
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
    try {
      const result = await client.chat.delete({
        channel: channelId,
        ts: messageId,
      });
      console.log("Message deleted from Instructor queue", result);
    } catch (error) {
      console.log(error);
    }
    try {
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
    } catch (error) {
      console.log(error);
      console.log(
        "Error occurred trying to remove student from queue. Error note added 16FEB22"
      );
    }
  }
}

// Function to handle "view_submission" type payloads (modal submission)
async function handleViewSubmission(payload, res) {
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
  }

  return res.status(200).send("");
}
exports.completeStudentUpdates = completeStudentUpdates;
exports.removeFromQueue = removeFromQueue;
exports.postQ = postQ;
exports.studentComplete = studentComplete;
exports.instructorComplete = instructorComplete;
exports.addBotToChannel = addBotToChannel;
exports.handleViewSubmission = handleViewSubmission;
exports.handleBlockActions = handleBlockActions;
exports.handleInteractiveMessage = handleInteractiveMessage;
