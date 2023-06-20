const serverless = require("serverless-http");
const express = require("express");
const app = express();
const students = require("./routes/student");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", students);


module.exports.handler = serverless(app);

/**
 * @description Flow of operations
 * 
 * @action Student Sends "/queue"
 * @result app.js -> "/" endoint in routes/student.js -> qCardModal() in QuestionCardModal.js
 * 
 * @action Student submits question card
 * @result app.js -> "/notify" endoint in routes/student.js -> handleViewSubmission() in helpers.js
 * 
 * @action Instructor clicks "In on Slack/Zoom" (Instructor claims card)
 * @result app.js -> "/notify" endoint in routes/student.js -> handleInteractiveMessage() in helpers.js
 *
 * @action Instructor clicks "Complete" (Instructor completes card)
 * @result app.js -> "/notify" endoint in routes/student.js -> handleBlockActions() in helpers.js
 */
