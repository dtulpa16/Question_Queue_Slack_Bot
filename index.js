const connectDB = require('./startup/db');
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const students = require('./routes/student')
const slackInteractiveMessages = require('@slack/interactive-messages');
const bot = require('./routes/student')


connectDB()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/students', students)

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server started on port: ${port}`)
})

const slackMessages =
  slackInteractiveMessages.createMessageAdapter('HIIl1XpglcSqYmTnptv6Ezer');

slackMessages.action('ping:instructor', (payload, respond) => {
    console.log('hello')
    // bot.pingInstructor(payload)
    //   .then(respond)
    //   .catch(console.error);
  
    // The updated message is returned synchronously in response
    return updatedMessage;
  });