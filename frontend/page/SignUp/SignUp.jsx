import './SignUp.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Email and Password Validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password);

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Check Email and Password Validity
    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      alert(
        'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.'
      );
      return;
    }

    try {
      const response = await fetch('https://linkedmailbackend.tabsgi.com:5000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token); // Store JWT in localStorage
        navigate('/MainPage'); // Redirect to MainPage
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Handle error (e.g., show message)
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.'); // Handle network errors
    }
  };

  return (
    <div className='body'>
      <div className="container-sign">
        <img alt="LinkedMail Logo" src='./signIn_logo.png' />
        <form onSubmit={handleSignUp}>
          <label htmlFor="email">Email*</label>
          <input
            id="email"
            placeholder="Enter Email..."
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Password*</label>
          <div className="password-container">
            <input
              id="password"
              placeholder="Enter Password..."
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              src={showPassword ? './eye.png' : './eye_close.png'}
              className="eye-icon"
              onClick={togglePasswordVisibility}
              alt="Toggle Password Visibility"
            />
          </div>
          <button type="submit">Sign Up</button>
          <div className="signin-link">Login To The System Using your Credentials</div>
        </form>
      </div>
      <div className="footer">Copyright © 2024 TGI. All Rights Reserved.</div>
    </div>
  );
}

export default SignUp;
