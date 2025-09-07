import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.role === 'teacher') {
        // Check if teacher already exists
        const checkResponse = await axios.post('http://localhost:5000/api/auth/check-teacher', {
          email: formData.email
        });

        if (checkResponse.data.exists) {
          alert('Teacher already registered. Redirecting to login.');
          navigate('/login');
          return;
        }

        // Register new teacher
        const response = await axios.post('http://localhost:5000/api/auth/register-teacher', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });

        if (response.data.shouldRedirect) {
          alert('Registration successful! Please login.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="flex w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-lg">
        
        {/* Left Side - Illustration */}
        <div className="w-1/2 bg-indigo-500 flex flex-col items-center justify-center text-white p-10">
          <img
            src="/illustration.svg" // Replace with your actual SVG or illustration path
            alt="Illustration"
            className="w-3/4"
          />
          <p className="mt-6 text-lg"></p>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">REGISTER</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your information to register</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Are you a student or teacher?</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="johnsmith"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="johnsmith@example.com"
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
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md transition"
            >
              Register Now
            </button>

            <p className="text-sm text-gray-600 text-center">
              Already registered? <a href="/login" className="text-indigo-500 hover:underline">Login here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
