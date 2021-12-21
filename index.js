const connectDB = require('./startup/db');
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const students = require('./routes/student')

connectDB()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/students', students)

const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`Server started on port: ${port}`)
})