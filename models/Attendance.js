const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true
  },
  date: {
    type: String, // format: DD/MM/YYYY
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  studentsPresent: {
    type: [String], // list of student names
    required: true
  },
  imageFilename: {
    type: String,
    required: true
  }
}, { collection: 'Attendances', timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
// This schema defines the structure of the attendance records in the database.