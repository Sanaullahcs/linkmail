import { useEffect, useState } from 'react';
import './EmailHistory.css';
import '../MainPage/MainPage.css';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import * as XLSX from 'xlsx'; // Import XLSX for Excel download

function EmailHistory() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEmailId, setOpenEmailId] = useState(null); // Track which email's modal is open
  const [currentPage, setCurrentPage] = useState(1); // Track the current page number
  const [emailsPerPage] = useState(6); // Set the number of emails per page
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch email history from the backend
    const fetchEmailHistory = async () => {
      try {
        const response = await fetch(`https://linkedmailbackend.tabsgi.com:5000/emailHistory`);
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

  // Excel Download Functionality
  const downloadExcel = () => {
    const emailData = emails.map((email) => ({
      'Sender Email': email.senderEmail,
      Subject: email.subject,
      Body: email.body,
      Recipients: email.recipients.join(', '),
      'Sent Time': new Date(email.sentAt).toLocaleString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(emailData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EmailHistory');
    XLSX.writeFile(workbook, 'EmailHistory.xlsx');
  };

  // Pagination logic
  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="email-history">
      <div className="email-history-header">
        <div className="table-data-header">
          <div className='action-button-text'>
            <button onClick={handleBack} className="back-button action-button">
              <img src='./arrowleft.png' alt="Back" />
            </button>
            <h1 className='header-heading'>Email History</h1>
          </div>
          <div className="buttons-container">
            <button
              className="action-button email-history-btn d-excel-btn"
              onClick={downloadExcel}
            >
              Download as Excel
            </button>
          </div>
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
                  <th>Sent Time</th>
                </tr>
              </thead>
              <tbody>
                {currentEmails.map((email) => (
                  <tr key={email._id}>
                    <td>{email.senderEmail}</td>
                    <td>{email.subject}</td>
                    <td className="tooltip" data-tooltip={email.body.length > 50 ? email.body : ''}>
                    {email.body.length > 50 ? `${email.body.substring(0, 50)}...` : email.body}
                  </td>
                    <td>
                      <button
                        className="view-profile view-email-btn"
                        onClick={() => openModal(email._id)}
                      >
                        View Recipients ({email.recipients.length})
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
                    <td>
                      {new Date(email.sentAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })} |&#32;
                      {new Date(email.sentAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="pagination">
              {Array.from({ length: Math.ceil(emails.length / emailsPerPage) }, (_, index) => (
                <button
                  key={index}
                  className={`pagination-button ${index + 1 === currentPage ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmailHistory;
