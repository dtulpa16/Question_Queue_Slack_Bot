const mongoose = require("mongoose");

const classQueueSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  channel: { type: String, required: true, maxlength: 100 },
  ts: { type: String, required: true, maxlength: 100 },
});
const genQueueSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  channel: { type: String, required: true, maxlength: 100 },
  ts: { type: String, required: true, maxlength: 100 },
});
const instructorQueueSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  channel: { type: String, required: true, maxlength: 100 },
  ts: { type: String, required: true, maxlength: 100 },
});
const studentUpdateSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  channel: { type: String, required: true, maxlength: 100 },
  ts: { type: String, required: true, maxlength: 100 },
});
const replySchema = new mongoose.Schema({
  messageTs: { type: String, required: true, maxlength: 100 },
  replyTs: { type: String, required: true, maxlength: 100 },
  channel: { type: String, required: true, maxlength: 100 },
});

const classQueue = mongoose.model('classQueue', classQueueSchema)
const GenQueue = mongoose.model('GenQueue', genQueueSchema)
const InstructorQueue = mongoose.model('InstructorQueue', instructorQueueSchema)
const StudentUpdateQueue = mongoose.model('StudentUpdateQueue', studentUpdateSchema)
const qCardReplies = mongoose.model('QCardReplies', replySchema)
exports.classQueue = classQueue
exports.GenQueue = GenQueue
exports.InstructorQueue = InstructorQueue
exports.StudentUpdateQueue = StudentUpdateQueue
exports.qCardReplies = qCardReplies