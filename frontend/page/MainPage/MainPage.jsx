// src/MainPage.jsx
import { useState, useEffect } from "react";
import "./MainPage.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";

export default function MainPage() {
  const [role, setRole] = useState("");
  const [country, setCountry] = useState(""); // New state for Country
  const [stateRegion, setStateRegion] = useState(""); // New state for State
  const [states, setStates] = useState([]);
  const [emailExtension, setEmailExtension] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    // Define the function inside your component
    const openComposeEmail = () => {
      window.location.href = "mailto:someone@example.com?subject=Your%20Subject&body=Your%20message%20here";
    };
  // Handle form submission to search profiles
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/searchEmails`, {
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
      const response = await fetch(`${import.meta.env.VITE_URL}/getStates`, {
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

  // Navigate to the Email Sending Page
  const navigateToEmailPage = () => {
    navigate("/email");
  };

  // Navigate to the Email History Page
  const navigateToEmailHistory = () => {
    navigate("/emailHistory");
  };

  // Check if any profiles have emails to enable/disable Email Page button
  const hasEmails = profiles.some((profile) => profile.email);

  return (
    <>
      <div className="container">
        <div className="sidebar">
          <img className="logo" src="./tgi.png" />
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
                Email Filter
              </label>
            </div>
            <button type="Submit" className="search-button">
              Search
            </button>
          </form>
        </div>
        <div className="main-content">
         <div className="table-data-header">
         <h2>linkedMail</h2>
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
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => (
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
              <div className="pagination">
            {/* <a href="#">&laquo;</a> */}
            <a href="#">1</a>
            <a href="#">2</a>
            
            {/* <a href="#">&raquo;</a> */}
          </div>
              </>
            
            )}
            </div>
          )}
          {profiles.length > 0 && !loading && (
          <div className="buttons-container">
            <button
              onClick={handleRefresh}
              className="action-button refresh-btn"
            >
              <img src="./refresh.png" />
            </button>
            <button
              className="action-button send-email-btn"
              disabled={!hasEmails}
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
          )}
        </div>

      </div>
      <footer>Copyright © 2024 TGI. All Rights Reserved.</footer>

    </>
  );
}
