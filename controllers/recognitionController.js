const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const Attendance = require('../models/Attendance'); // NEW

exports.processImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { teacherName, date, timeSlot } = req.body;

    if (!teacherName || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing attendance details (teacherName, date, timeSlot)' });
    }

    const imagePath = req.file.path;
    const scriptPath = path.join(__dirname, '../../recognize.py');
    console.log('Script path:', scriptPath);

    const pythonProcess = spawn('python', [scriptPath, imagePath]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: 'Processing failed' });
      }

      const resultsPath = path.join(
        __dirname,
        '../../backend/Output',
        path.basename(imagePath).replace('.jpg', '_attendance.txt')
      );

      console.log('Looking for attendance file at:', resultsPath);

      try {
        const results = await fs.readFile(resultsPath, 'utf8');
        const studentList = results.split('\n').filter(Boolean);

        // ✅ Insert into MongoDB
        const attendanceRecord = new Attendance({
          teacherName,
          date,
          timeSlot,
          studentsPresent: studentList,
          imageFilename: path.basename(imagePath)
        });

        await attendanceRecord.save();

        res.json({
          success: true,
          message: 'Attendance processed and recorded',
          filename: path.basename(imagePath),
          attendance: studentList
        });
      } catch (err) {
        console.error('Error reading attendance file:', err);
        res.status(500).json({ message: 'Failed to read attendance file' });
      }
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
