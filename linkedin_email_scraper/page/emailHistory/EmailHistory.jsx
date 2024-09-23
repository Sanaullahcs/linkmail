// src/pages/EmailHistory.jsx
import { useEffect, useState } from 'react';
import './EmailHistory.css';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';

function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
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

  // Handle opening the modal with recipients
  const openModal = (recipients) => {
    setSelectedRecipients(recipients);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipients([]);
  };

  return (
    <div className="email-history">
      <div className="email-history-header">
        <h1>Email History</h1>
        <button onClick={handleBack} className="back-button">
          Back
        </button>
      </div>
      {loading ? (
        <div className="loading-spinner">
          <Oval height={80} width={80} color="#4fa94d" />
        </div>
      ) : emails.length === 0 ? (
        <p>No emails have been sent yet.</p>
      ) : (
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
                      className="view-emails-button"
                      onClick={() => openModal(email.recipients)}
                    >
                      View Emails ({email.recipients.length})
                    </button>
                  </td>
                  <td>{new Date(email.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing recipients */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Recipients</h2>
            <ul>
              {selectedRecipients.map((recipient, index) => (
                <li key={index}>{recipient}</li>
              ))}
            </ul>
            <button onClick={closeModal} className="close-modal-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailHistory;
