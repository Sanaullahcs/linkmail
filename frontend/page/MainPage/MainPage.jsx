// src/MainPage.jsx
import { useState } from 'react';
import './MainPage.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';

export default function MainPage() {
  const [role, setRole] = useState('');
  const [country, setCountry] = useState(''); // New state for Country
  const [stateRegion, setStateRegion] = useState(''); // New state for State
  const [emailExtension, setEmailExtension] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission to search profiles
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch(`${import.meta.env.VITE_URL}/searchEmails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role,  country, stateRegion, emailExtension }), // Include country and stateRegion
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const data = await response.json();
      setProfiles(data.profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      alert('An error occurred while fetching profiles.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle refreshing the form and profiles
  const handleRefresh = () => {
    setRole('');
    setCountry(''); // Reset Country
    setStateRegion(''); // Reset State
    setEmailExtension('');
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profiles');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'profiles.xlsx');
  };

  // Navigate to the Email Sending Page
  const navigateToEmailPage = () => {
    navigate('/email');
  };

  // Navigate to the Email History Page
  const navigateToEmailHistory = () => {
    navigate('/emailHistory');
  };

  // Check if any profiles have emails to enable/disable Email Page button
  const hasEmails = profiles.some((profile) => profile.email);

  return (
    <div className="App">
      <h1>LinkedIn Profile Extractor</h1>
      <div className="content-container">
        {/* Search Form Container */}
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <label>
              Role: (e.g., CEO)
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="Enter role"
              />
            </label>
            {/* <label>
              Location: (e.g., California)
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Enter location"
              />
            </label> */}
            <label>
              Country: (e.g., USA)
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                placeholder="Enter country"
              />
            </label>
            <label>
              State: (e.g., California)
              <input
                type="text"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                required
                placeholder="Enter state"
              />
            </label>
            {/* Conditionally render Email Extension filter */}
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
            <div className="form-buttons">
              <button type="submit" className="search-button">
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilter(!showFilter)}
                className="filter-button"
              >
                {showFilter ? 'Hide Filter' : 'Add Filter'}
              </button>
            </div>
          </form>
        </div>

        {/* Data Table Container */}
        <div className="table-container">
          {loading ? (
            <div className="loading-spinner">
              <Oval height={80} width={80} color="#4fa94d" />
            </div>
          ) : profiles.length > 0 ? (
            <>
              <h2>Extracted Profiles</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      {/* <th>Location</th> */}
                      <th>Country</th>
                      <th>State</th>
                      <th>Profile Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile, index) => (
                      <tr key={index}>
                        <td>{profile.name}</td>
                        <td>{profile.email}</td>
                        <td>{profile.role}</td>
                        {/* <td>{profile.location}</td> */}
                        <td>{profile.country}</td>
                        <td>{profile.stateRegion}</td>
                        <td>
                          <a href={profile.profileLink} target="_blank" rel="noopener noreferrer">
                            View Profile
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={downloadExcel} className="table_button">
                Download as Excel
              </button>
            </>
          ) : (
            <p>No profiles found. Please perform a search.</p>
          )}
        </div>
      </div>

      {/* Buttons Container */}
      <div className="buttons-container">
        <button onClick={handleRefresh} className="action-button">
          Refresh
        </button>
        <button
          onClick={navigateToEmailPage}
          className="action-button"
          disabled={!hasEmails}
        >
          Go to Email Page
        </button>
        <button onClick={navigateToEmailHistory} className="action-button">
          View Email History
        </button>
      </div>
    </div>
  );
}
