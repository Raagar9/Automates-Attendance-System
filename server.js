require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/SDAM', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Ensure Input directory exists
const inputDir = path.join(__dirname, 'Input');
if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir);
}

// Ensure Output directory exists
const outputDir = path.join(__dirname, 'Output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Output/'),  // Changed from Input to Output
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const authController = require('./controllers/authController');
const recognitionController = require('./controllers/recognitionController');
const attendanceController = require('./controllers/attendanceController');

// Routes
app.post('/api/auth/check-teacher', authController.checkTeacher);
app.post('/api/auth/register-teacher', authController.registerTeacher);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register-student', authController.registerStudent);

// Upload & Process
app.post('/api/upload', upload.single('image'), recognitionController.processImage);

// Student attendance retrieval NEW
app.get('/api/student-attendance', attendanceController.getAttendanceForStudent);

// View / Download
app.get('/api/view-attendance/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'Output', req.params.filename.replace('.jpg', '_attendance.txt'));
  res.sendFile(filePath);
});

app.get('/api/download-attendance/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'Output', req.params.filename.replace('.jpg', '_attendance.txt'));
  res.download(filePath);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
