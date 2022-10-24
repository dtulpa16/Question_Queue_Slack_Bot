# devCodeCamp Question Queue Slack Bot

A Slack Bot developed for the dCC Slack Workspace. The Question Queue Bot was developed to streamline the process of helping students troubleshoot their errors.

The bot is hosted on AWS using a Lambda Function.


## /queue Demo (Student Side) 

![student-side-demo](https://github.com/dtulpa16/Question_Queue_Slack_Bot/blob/main/QQstudentsidedemo1.gif)

## Instructor Question Card Interaction

![instructor-side-demo](https://github.com/dtulpa16/Question_Queue_Slack_Bot/blob/main/QQinstructorsidedemo1.gif)

# Tech Stack


**Client:** ![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white) 

**Server:** ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)![Ngrok](https://img.shields.io/badge/Ngrok-4A1f4R?style=for-the-badge&logo=ngrok&logoColor=black)

**DBs:** ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Realm](https://img.shields.io/badge/Realm-39477F?style=for-the-badge&logo=realm&logoColor=white) ![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)

**APIs:** ![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)

**Languages:** ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)![Markdown](https://img.shields.io/badge/markdown-%23000000.svg?style=for-the-badge&logo=markdown&logoColor=white)![PowerShell](https://img.shields.io/badge/PowerShell-%235391FE.svg?style=for-the-badge&logo=powershell&logoColor=white)


# Endpoint Reference

#### Open Question Card Modal

```http
  POST /api/student/
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |


# Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`SLACK_API_KEY`



# Deployment

To deploy this project run

```bash
  serverless deploy
```


# Run Locally
### An Ngrok HTTP tunnel is required to run this bot Locally (Will not run on local host)
#### -The URL provided by the Ngrok tunnel will be used in the listed endpoints within the Slack API webpage

---
1. Clone the project

```bash
  git clone https://github.com/dtulpa16/Question_Queue_Slack_Bot.git
```
2. Go to the project directory

```bash
  cd Question_Queue_Slack_Bot
```
3. Install dependencies

```bash
  npm install
```
4. Download [ngrok HTTP tunnel](https://ngrok.com/)
5. Create an account & follow the ["Getting Started" guide](https://ngrok.com/docs/getting-started)
6. Create tunnel on your local host 3000 port 
```bash
  ngrok http 3000
```
7. Copy the provided url (ending in .ngrok.io) and paste in in the Slack API "Slash Command" tab + the "Event Subscriptions" tab


8. Create an index.js file and paste the following code inside:
```javascript
const connectDB = require ('./startup/db')
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const student = require('./routes/student')

connectDB()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/student', student)


const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server started on port: ${port}`)
})
```
9. Start the server

```bash
  npm start
```
10. Test by running a slash command


### ![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white) API Documentation
---

* [Official](https://api.slack.com/)
* [Styled messages using "Blocks"](https://api.slack.com/block-kit) 
* [Post message](https://api.slack.com/methods/chat.postMessage) ```client.postMessage({})```
* [Open modal](https://api.slack.com/methods/views.open) ```client.views.open({})```
* [Open modal over existing modal](https://api.slack.com/methods/views.push) ```client.views.push({})```
* [Update modal](https://api.slack.com/methods/views.update) ```client.views.update({})```
* [OAUTH Access](https://api.slack.com/methods/oauth.v2.access) ```client.oauth.v2.access({})```
* [User info (used for verifying users are an admin)](https://api.slack.com/methods/users.info) ```client.users.info({})```


## Appendix

Use of this Bot outside of the dCC workspace is prohibited

