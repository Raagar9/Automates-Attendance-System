const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

exports.getAttendanceForStudent = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Step 1: Find student name from email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentName = student.name.trim().toLowerCase(); // Normalize for match safety

    // Step 2: Fetch all attendance records
    const allRecords = await Attendance.find({});

    // Step 3: Filter into present/absent
    const attendanceHistory = allRecords.map(record => {
      const normalizedPresentList = record.studentsPresent.map(name => name.trim().toLowerCase());

      return {
        date: record.date,
        timeSlot: record.timeSlot,
        status: normalizedPresentList.includes(studentName) ? 'Present' : 'Absent'
      };
    });

    res.json({ studentName: student.name, attendanceHistory });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
