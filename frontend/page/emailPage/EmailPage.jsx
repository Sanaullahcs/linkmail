import { useState } from 'react';
import './EmailPage.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function EmailPage({ profiles }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    if (!subject || !body) {
      alert('Subject and body are required.');
      return;
    }

    const emailAddresses = profiles.map(profile => profile.email);

    // const emailAddresses = ['tgimajid55@gmail.com']

    const response = await fetch(`http://localhost:5000/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, body, emailAddresses }),
    });

    if (response.ok) {
      alert('Emails sent successfully!');
    } else {
      alert('Error sending emails.');
    }
  };

  // Function to handle navigating back to the previous page
  const handleBack = () => {
    navigate(-1); // This navigates back to the previous page in the history
  };

  return (
    <div className="email-page">
      <h1>Email Sender</h1>
      <div className="email-form">
        <label>
          Subject:
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </label>
        <label>
          Body:
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>
        <button onClick={handleSendEmail}>Send Emails</button>
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
    </div>
  );
}

// Define prop-types validation for profiles
EmailPage.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string,
    location: PropTypes.string,
    profileLink: PropTypes.string,
  })).isRequired,
};

export default EmailPage;
