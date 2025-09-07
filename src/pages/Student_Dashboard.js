import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Student_Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentName, setStudentName] = useState('');
  const currentDate = new Date().toLocaleDateString();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const studentData = location.state?.student;
  
    if (!studentData) {
      console.log('No student data found, redirecting to login');
      navigate('/login');
      return;
    }
  
    setStudentName(studentData.name);
  
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/student-attendance?email=${studentData.email}`);
        const data = await res.json();
        setAttendanceData(data.attendanceHistory);
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAttendance();
  }, [navigate, location]);

  // Add a loading state
  if (!location.state?.student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome, {studentName}
          </h2>
          <p className="text-gray-600">Today: {currentDate}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Your Attendance History</h3>
          {loading ? (
            <p>Loading attendance...</p>
            ) : attendanceData.length > 0 ? (
            <table className="min-w-full table-auto text-left border">
                <thead>
                <tr className="bg-gray-100">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Time Slot</th>
                    <th className="px-4 py-2">Status</th>
                </tr>
                </thead>
                <tbody>
                {attendanceData.map((entry, index) => (
                    <tr key={index} className="border-t">
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className="px-4 py-2">{entry.timeSlot}</td>
                    <td className={`px-4 py-2 font-semibold ${entry.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.status}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            <p className="text-gray-600">No attendance records found yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Student_Dashboard;