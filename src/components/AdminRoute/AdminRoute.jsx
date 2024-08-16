import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  console.log(currentUser, isAdmin)
  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

export default AdminRoute;