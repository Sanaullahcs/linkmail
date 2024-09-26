import { useEffect, useState } from 'react';
import './EmailHistory.css';
import '../MainPage/MainPage.css';

import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';

function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEmailId, setOpenEmailId] = useState(null); // Track which email's modal is open
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch email history from the backend
    const fetchEmailHistory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_URL}/emailHistory`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEmails(data.emails);
      } catch (error) {
        console.error('Error fetching email history:', error);
        alert('Failed to fetch email history.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmailHistory();
  }, []);

  // Handle Back button click
  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  // Handle opening the modal with recipients for a specific email
  const openModal = (emailId) => {
    setOpenEmailId(emailId === openEmailId ? null : emailId); // Toggle modal for the clicked email
  };

  return (
    <div className="email-history">
      <div className="email-history-header">
        <div className="table-data-header"> 
          <button onClick={handleBack} className="back-button action-button">
            <img src='./arrowleft.png' alt="Back" />
          </button>
          <h1 className='header-heading'>Email History</h1>
        </div>
      </div>
      {loading ? (
        <div className="loading-spinner">
          <Oval height={80} width={80} color="#4fa94d" />
        </div>
      ) : emails.length === 0 ? (
        <p>No emails have been sent yet.</p>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sender Email</th>
                  <th>Subject</th>
                  <th>Body</th>
                  <th>Recipients</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email._id}>
                    <td>{email.senderEmail}</td>
                    <td>{email.subject}</td>
                    <td>{email.body}</td>
                    <td>
                      <button
                        className="view-profile view-email-btn"
                        onClick={() => openModal(email._id)}
                      >
                        View Emails ({email.recipients.length})
                      </button>

                      {openEmailId === email._id && (
                        <div className="dropdown">
                          <div onClick={(e) => e.stopPropagation()} className="dropdown-content">
                            <ul>
                              {email.recipients.map((recipient, index) => (
                                <li key={index}>{recipient}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>{new Date(email.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="divider"></div>
            <div className="pagination">
              <a href="#">1</a>
              <a href="#">2</a>
            </div>
          </div>
          <div className="buttons-container">
            <button className="action-button email-history-btn d-excel-btn">
              Download as Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EmailHistory;
