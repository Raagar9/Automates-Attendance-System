import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isTeacher = location.state?.teacher?.role === 'teacher';
  
  if (!isTeacher) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default PrivateRoute;