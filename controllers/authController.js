const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.checkTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ email: req.body.email });
    res.json({ exists: !!teacher });
  } catch (error) {
    console.error('Check teacher error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerTeacher = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ 
        message: 'Teacher already exists',
        shouldRedirect: true 
      });
    }

    // Create new teacher
    const teacher = new Teacher({
      name: username,
      email,
      password
    });

    await teacher.save();
    res.status(201).json({ 
      message: 'Teacher registered successfully',
      shouldRedirect: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.registerStudent = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student already exists',
        shouldRedirect: true 
      });
    }

    // Create new student
    const student = new Student({
      name: username,
      email,
      password
    });

    await student.save();
    res.status(201).json({ 
      message: 'Student registered successfully',
      shouldRedirect: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ email, password });
      
      if (!teacher) {
        return res.status(401).json({ 
          message: 'Teacher not found',
          shouldRegister: true
        });
      }

      res.json({
        success: true,
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher'
        }
      });
    } 
    else if (role === 'student') {
      console.log('Attempting student login with:', { email, password });
      
      const student = await Student.findOne({ email, password });
      console.log('Found student:', student);
      
      if (!student) {
        console.log('No student found with these credentials');
        return res.status(401).json({ 
          message: 'Student not found',
          shouldRegister: true
        });
      }

      // Make sure all necessary data is included in the response
      return res.json({
        success: true,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: 'student',
          faceEmbeddings: student.faceEmbeddings || []
        }
      });
    }
    else {
      res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.authenticateToken = (req, res, next) => {
  next();
};