import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherName, setTeacherName] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [attendanceResults, setAttendanceResults] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const currentDate = new Date().toLocaleDateString();

  // Generate time slots from 8 AM to 6 PM
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour}:00 - ${hour + 1}:00`;
  });

  useEffect(() => {
    const teacherData = location.state?.teacher;
    if (!teacherData) {
      navigate('/login');
    } else {
      setTeacherName(teacherData.name);
    }
  }, [navigate, location]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setUploadStatus('✓ File selected: ' + file.name);
        setUploadError('');
      } else {
        setUploadError('Please select an image file');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedTime) {
      setUploadError('Please select both a file and time slot');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('timeSlot', selectedTime);
    formData.append('date', currentDate);
    formData.append('teacherName', teacherName); // use from login context

    try {
      setShowForm(false);
      setProcessing(true);
      setUploadError('');

      const response = await axios.post('http://localhost:5000/api/upload', formData);
      
      if (response.data.success) {
        setAttendanceResults(response.data);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error.response?.data?.message || 'Upload failed');
      setProcessing(false);
      setShowForm(true);
    }
  };

  const handleView = async (filename) => {
    try {
      setIsViewing(true);
      window.open(`http://localhost:5000/api/view-attendance/${filename}`, '_blank');
    } catch (error) {
      console.error('View failed:', error);
    } finally {
      setIsViewing(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      setIsDownloading(true);
      window.open(`http://localhost:5000/api/download-attendance/${filename}`, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Greeting Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome, {teacherName}
          </h2>
          <p className="text-gray-600">Today: {currentDate}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          {showForm ? (
            // Attendance Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Time Slot Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Choose a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
                {uploadStatus && (
                  <p className="mt-1 text-sm text-green-600">{uploadStatus}</p>
                )}
                {uploadError && (
                  <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
              >
                Submit Attendance
              </button>
            </form>
          ) : processing ? (
            // Processing State
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Marking attendance...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full animate-[loading_2s_ease-in-out_infinite]" 
                     style={{ width: '100%' }}></div>
              </div>
            </div>
          ) : (
            // Results State
            attendanceResults?.attendance?.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Attendance Marked Successfully</h3>
                <ul className="list-disc list-inside text-gray-800">
                  {attendanceResults.attendance.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleView(attendanceResults.filename)}
                    disabled={isViewing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {isViewing ? 'Opening...' : 'View Attendance'}
                  </button>
                  <button
                    onClick={() => handleDownload(attendanceResults.filename)}
                    disabled={isDownloading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {isDownloading ? 'Downloading...' : 'Download Attendance'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No attendance data found.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;