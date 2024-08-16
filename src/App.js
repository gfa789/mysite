import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Home from './components/Home/Home';
import About from './components/About/About';
import SignIn from './components/SignIn/SignIn';
import Navbar from './components/Navbar/Navbar';
import Register from './components/Register/Register';
import Settings from './components/Settings/Settings';
// import EmailVerification from './components/EmailVerification/EmailVerification';
import PasswordReset from './components/PasswordReset/PasswordReset';
import MFAEnrollment from './components/MFAEnrollment/MFAEnrollment';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute/AdminRoute';
import Profile from './components/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard';

import { ThemeProvider } from './ThemeContext';

function App() {

  return (
    <AuthProvider>
    <ThemeProvider>   
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path = "/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
              </PrivateRoute>} />

          <Route path="/email-verification" element={
            <PrivateRoute>
                  <MFAEnrollment />
                </PrivateRoute>} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/mfa-enrollment" element={<PrivateRoute>
                  <MFAEnrollment />
                </PrivateRoute>} />
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
    </Router>
    </ThemeProvider>
    </AuthProvider>
 
  );
}

export default App;