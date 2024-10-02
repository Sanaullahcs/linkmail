// src/MainPage.jsx
import { useState, useEffect } from "react";
import "./MainPage.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import "../emailPage/EmailPage.css"

export default function MainPage() {
  const [role, setRole] = useState("");
  const [country, setCountry] = useState(""); // New state for Country
  const [stateRegion, setStateRegion] = useState(""); // New state for State
  const [states, setStates] = useState([]);
  const [emailExtension, setEmailExtension] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page number
  const [profilePerPage] = useState(8);
  const [showModal, setShowModal] = useState(false); // State for toggling modal visibility
  const [recipient, setRecipient] = useState(""); // To field
  const [recipientsList, setRecipientsList] = useState([]);
  const [subject, setSubject] = useState(""); // Subject field
  const [body, setBody] = useState(""); // Body field
  const [showAll, setShowAll] = useState(false); 
  const [recipientEmails, setRecipientEmails] = useState([]);

  const navigate = useNavigate();
const openComposeEmail = () => {
  // If there are profiles with emails, extract them and show as tags
  if (profiles.length > 0) {
    const emails = profiles
      .map((profile) => profile.email)
      .filter((email) => email); // Remove any empty email entries
      setRecipientEmails(emails);
    setRecipient(emails.join(", "));
  } else {
    setRecipientEmails([]);
    setRecipient("");
  }
  setShowModal(true); // Show the modal when Send Email is clicked
};

const handleCloseModal = () => {
  setShowModal(false); // Hide the modal
  setRecipient(""); 
  setRecipientsList([]); 
  setRecipientEmails([]);
};


// Toggle between showing and hiding all emails
const handleToggleEmails = () => {
setShowAll(!showAll);
};

// Handle removing individual email tags
const handleRemoveEmail = (email) => {
const updatedEmails = recipientEmails.filter((recipient) => recipient !== email);
setRecipientEmails(updatedEmails);
};
const handleSendEmail = async () => {
  if (!subject || !body) {
    alert('Subject and body are required.');
    return;
  }

  const emailAddresses = recipientsList.length > 0 ? recipientsList : [recipient];

  // const emailAddresses = [recipient]

  const response = await fetch(`https://linkedmailbackend.tabsgi.com:5000/sendEmail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subject, body, emailAddresses }),
  });

  if (response.ok) {
    alert('Emails sent successfully!');
    handleCloseModal();
  } else {
    alert('Error sending emails.');
  }

};


  
  // Handle form submission to search profiles
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch(`https://linkedmailbackend.tabsgi.com:5000/searchEmails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, country, stateRegion, emailExtension }), // Include country and stateRegion
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      const data = await response.json();
      setProfiles(data.profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      alert("An error occurred while fetching profiles.");
    } finally {
      setLoading(false); // Stop loading
    }
  };
  // Function to fetch states based on the country code when state dropdown is clicked
  const handleStateClick = async () => {
    try {
      const response = await fetch(`https://linkedmailbackend.tabsgi.com:5000/getStates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country: country }), // Send the country code in uppercase
      });

      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }

      const data = await response.json();
      setStates(data.states || []); // Update states if data exists
    } catch (error) {
      console.error("Error fetching states:", error);
      alert("An error occurred while fetching states.");
    }
  };

   // Trigger fetchStates when the country changes
   useEffect(() => {
   
  }, [country]);
  // Handle refreshing the form and profiles
  const handleRefresh = () => {
    setRole("");
    setCountry(""); // Reset Country
    setStateRegion(""); // Reset State
    setEmailExtension("");
    setProfiles([]);
    setLoading(false);
  };

  // Handle downloading profiles as Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      profiles.map((profile) => ({
        Email: profile.email,
        Name: profile.name,
        Role: profile.role,
        Country: profile.country,
        State: profile.stateRegion,
        ProfileLink: profile.profileLink,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "profiles.xlsx");
  };

  
  // Handle file upload and extract emails
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Find the email column
        const emailColumnIndex = data[0].findIndex((col) => col.toLowerCase().includes("email"));
        if (emailColumnIndex !== -1) {
          const emails = data.slice(1).map((row) => row[emailColumnIndex]).filter((email) => email);
  
          // Set the emails in the recipientEmails state
          setRecipientEmails(emails);
          setRecipient(emails.join(", "));
        } else {
          alert("No email column found in the uploaded file.");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
    // alert('Logged out successfully.');
  };

  
  // Navigate to the Email History Page
  const navigateToEmailHistory = () => {
    navigate("/emailHistory");
  };
   // Function to slice profiles based on pagination
   const indexOfLastProfile = currentPage * profilePerPage;
   const indexOfFirstProfile = indexOfLastProfile - profilePerPage;
   const currentProfiles = profiles.slice(indexOfFirstProfile, indexOfLastProfile);

   // Change page
   const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="container">
        <div className="sidebar">
          <img className="logo" src="./Layer_1.png" />
          <div className="divider"></div>
          <form className="form" onSubmit={handleSubmit}>
            <label htmlFor="role">Enter a Role*</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              id="role"
              placeholder="Role..."
            />

            <label htmlFor="country">Country*</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              id="country"
              placeholder="Country..."
            />

            <label htmlFor="state">Select State*</label>
            <select
              id="state"
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              onClick={handleStateClick}
              required
            >
              <option value="">Select state</option>
              {/* Dynamically populate dropdown with fetched states */}
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
            {showFilter && (
              <label>
                Email Extension:
                <input
                  type="text"
                  value={emailExtension}
                  onChange={(e) => setEmailExtension(e.target.value)}
                  placeholder="@example.com"
                />
              </label>
            )}
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="email-filter"
                checked={showFilter}
                onChange={() => setShowFilter(!showFilter)}
              />
              <label htmlFor="email-filter" className="checkbox-label">
                Email Filter*
              </label>
            </div>
            <button type="Submit" className="search-button">
              Search
            </button>
          </form>
        </div>
        <div className="main-content">
         <div className="table-data-header">
         <h2>Extracted Profiles</h2>
          {profiles.length > 0 && !loading && (
            <button onClick={downloadExcel} className="action-button download-excel-btn">
              Download as Excel
            </button>
          )}
         </div>
          {loading ? (
            <div className="loading-spinner">
              <Oval height={80} width={80} color="#F8760B" />
            </div>
          ) : (
            <div className="table-wrapper">
            <table >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Country</th>
                  <th>State</th>
                  <th>Profile Link</th>
                </tr>
              </thead>
              <tbody>
                {currentProfiles.length > 0 ? (
                  currentProfiles.map((profile, index) => (
                    <tr key={index}>
                      <td>{profile.name}</td>
                      <td>{profile.email}</td>
                      <td>{profile.role}</td>
                      <td>{profile.country}</td>
                      <td>{profile.stateRegion}</td>
                      <td>
                        <a
                          href={profile.profileLink}
                          target="_blank"
                          className="view-profile"
                          rel="noopener noreferrer"
                        >
                          View Profile
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <img src="./Group.png" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {profiles.length > 0 && !loading && (
              <>
              <div className="divider"></div>
             {/* Pagination */}
             <div className="pagination">
              {Array.from({ length: Math.ceil(profiles.length / profilePerPage) }, (_, index) => (
                <button
                  key={index}
                  className={`pagination-button ${index + 1 === currentPage ? 'active' : ''}`}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
              </>
            
             )} 
            </div>
          )}
          {/* {profiles.length > 0 && !loading && ( */}
          <div className="buttons-container">
            <button
              onClick={handleRefresh}
              className="action-button refresh-btn"
            >
              <img src="./refresh.png" />
            </button>
            <button
              className="action-button send-email-btn"
              // disabled={!hasEmails}
              onClick={openComposeEmail}
              
            >
              Send Email
            </button>
            <button
              onClick={navigateToEmailHistory}
              className="action-button email-history-btn"
            >
              Email History
            </button>
          </div>
          {/* <div className="divider"></div> */}
          <div className="logout-button" onClick={handleLogout}>
          Logout: <img src="./logout.png" width={38} height={38} alt="logout"/>
          </div>
          {/* Email Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              {/* Header Section */}
              <div className="modal-header">
                <h2>Compose Email</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>

              {/* To Input */}
              <div className="modal-body">
              <div className="modal-section">
              <label htmlFor="recipient">To</label>
              <div id="recipient">
                {/* Display the first three emails inline */}
                {recipientEmails.slice(0, 3).map((email, index) => (
                  <div key={index} className="email-tag">
                    <span>{email}</span>
                    <button onClick={() => handleRemoveEmail(email)}>&times;</button>
                  </div>
                ))}

                {/* View More Button */}
                {recipientEmails.length > 3 && (
                  <button id="view-more-button" onClick={handleToggleEmails}>
                    {showAll ? "Hide Emails" : "View All Emails"}
                  </button>
                )}

                {/* Hidden Emails */}
                <div className={`scrollable-emails ${showAll ? "show-scroll" : ""}`}>
                  {recipientEmails.slice(3).map((email, index) => (
                    <div key={index} className="email-tag">
                      <span>{email}</span>
                      <button onClick={() => handleRemoveEmail(email)}>&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
                <div className="divider-email"></div>
                {/* Subject Input */}
                <div className="modal-section">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    // placeholder="Email Subject"
                  />
                </div>
                <div className="divider-email"></div>
                {/* Body Input */}
                <div className="modal-section">
                  {/* <label htmlFor="body">Body:</label> */}
                  <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    // placeholder="Write your message here..."
                  ></textarea>
                </div>
              </div>

              {/* File Upload and Send Button */}
              <div className="modal-footer">
                <div className="file-upload">
                  <label htmlFor="file-upload" className="upload-btn">
                    <img src="./Icon.png"/>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    // onChange={(e) => setAttachment(e.target.files[0])}
                  />
                </div>
                <button className="send-btn" onClick={handleSendEmail}>
                <img src="./send_icon.png"/>
                </button>
              </div>
            </div>
          </div>
        )}
          {/* )} */}
        </div>

      </div>
      <footer>
        Powered by: <img src="./tgi.png" width={34} height={33}/></footer>

    </>
  );
}
