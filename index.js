const connectDB = require('./startup/db');
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const students = require('./routes/student')
const bot = require('./routes/student')
const serverless = require('serverless-http');

connectDB()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('api/students', students)

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Server started on port: ${port}`)
})
// app.listen(3000, () => console.log(`Listening on: 3000`));
module.exports.handler = serverless(app);