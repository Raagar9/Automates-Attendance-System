import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login response:', response.data); // Debug log
      
      if (response.data.success) {
        if (formData.role === 'student' && response.data.student) {
          console.log('Navigating to student dashboard with:', response.data.student);
          navigate('/student-dashboard', { 
            state: { 
              student: response.data.student 
            } 
          });
        } else if (formData.role === 'teacher' && response.data.teacher) {
          navigate('/dashboard', { 
            state: { 
              teacher: response.data.teacher 
            } 
          });
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response?.data?.shouldRegister) {
        alert(`${formData.role === 'teacher' ? 'Teacher' : 'Student'} not found. Please register first.`);
        navigate('/register');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-lg">
        {/* Left Side - Illustration */}
        <div className="w-1/2 bg-indigo-500 flex flex-col items-center justify-center text-white p-10">
          <img
            src="/illustration.svg"
            alt="Illustration"
            className="w-3/4"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">LOGIN</h2>
          <p className="text-sm text-gray-600 mb-6">Welcome back! Please login to your account</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition"
            >
              Login
            </button>

            <p className="text-sm text-gray-600 text-center">
              Don't have an account? <a href="/register" className="text-indigo-500 hover:underline">Register here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;