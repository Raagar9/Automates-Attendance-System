const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  faceEmbeddings: {
    type: Array,
    default: []
  }
}, { collection: 'Students' }); // Explicitly set the collection name

module.exports = mongoose.model('Student', studentSchema);