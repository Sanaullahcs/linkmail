import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmailPage from '../page/emailPage/EmailPage';
import MainPage from '../page/MainPage/MainPage';
import EmailHistory from '../page/emailHistory/EmailHistory';
import SignUp from '../page/SignUp/SignUp';
import PropTypes from 'prop-types';

// Check if User is Authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};

export default function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/MainPage" element={<ProtectedRoute element={<MainPage />} />} />
        <Route path="/email" element={<ProtectedRoute element={<EmailPage />} />} />
        <Route path='/emailHistory' element={<ProtectedRoute element={<EmailHistory />} />}/>
        <Route path="/" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

// Prop validation for ProtectedRoute
ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};