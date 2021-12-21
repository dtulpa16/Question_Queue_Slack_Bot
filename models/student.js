const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  cohort: { type: String, required: true, maxlength: 100 },
  time: { type: Date, default: Date.now },
});

const Student = mongoose.model('Student', studentSchema)
module.exports = Student