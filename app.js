const serverless = require("serverless-http");
const express = require("express");
const app = express();
const students = require("./routes/student");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", students);


// const port = process.env.PORT || 3000;
// app.listen(port, ()=>{
//     console.log(`Server started on port: ${port}`)
// })

module.exports.handler = serverless(app);

