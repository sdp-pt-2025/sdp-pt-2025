import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

/**
 * Example component showing how to integrate with Firebase Auth and call the Campus Study Buddy API
 * This is a demonstration component - you can use this as a reference for your own components
 */
const ApiExample = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("COMS3011");

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user);
        try {
          // Get the Firebase ID token
          const idToken = await user.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setError("Failed to get authentication token");
        }
      } else {
        setUser(null);
        setToken(null);
        setPartners([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Example login function (replace with your actual login UI)
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // This is just an example - replace with your actual login credentials
      // In a real app, you'd have a login form
      await signInWithEmailAndPassword(auth, "test@example.com", "password123");
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example logout function
  const handleLogout = () => {
    auth.signOut();
  };

  // Example API call to get study partners
  const fetchPartners = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/partners?module=${moduleFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPartners(data.data);
      } else {
        setError("API returned an error: " + data.error);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
      setError("Failed to fetch partners: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example API call to create a study group
  const createStudyGroup = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const groupData = {
        name: "Example Study Group",
        description: "Created via API example",
        module: "COMS3011",
        maxMembers: 6,
        location: "Library Study Room 1"
      };

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        alert("Study group created successfully!");
      } else {
        setError("API returned an error: " + data.error);
      }
    } catch (error) {
      console.error("Error creating study group:", error);
      setError("Failed to create study group: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="api-example"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <h2>Firebase + API Integration Example</h2>

      {/* Authentication Status */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px"
        }}
      >
        <h3>Authentication Status</h3>
        {user ? (
          <div>
            <p>
              <strong>✅ Logged in as:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user.uid}
            </p>
            <p>
              <strong>Token:</strong>{" "}
              {token ? "✅ Available" : "❌ Not available"}
            </p>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>
              <strong>❌ Not logged in</strong>
            </p>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Logging in..." : "Login (Example)"}
            </button>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              <strong>Note:</strong> This is a demo login. In a real app, you&apos;d
              have a proper login form.
            </p>
          </div>
        )}
      </div>

      {/* API Examples */}
      {user && token && (
        <div style={{ marginBottom: "20px" }}>
          <h3>API Examples</h3>

          {/* Fetch Partners */}
          <div
            style={{
              marginBottom: "15px",
              padding: "15px",
              backgroundColor: "#e9ecef",
              borderRadius: "5px"
            }}
          >
            <h4>Get Study Partners</h4>
            <div style={{ marginBottom: "10px" }}>
              <label htmlFor="moduleFilter">Module: </label>
              <input
                id="moduleFilter"
                type="text"
                value={moduleFilter}
                onChange={e => setModuleFilter(e.target.value)}
                style={{
                  padding: "5px",
                  marginLeft: "10px",
                  borderRadius: "3px",
                  border: "1px solid #ccc"
                }}
              />
            </div>
            <button
              onClick={fetchPartners}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Loading..." : "Fetch Partners"}
            </button>
          </div>

          {/* Create Study Group */}
          <div
            style={{
              marginBottom: "15px",
              padding: "15px",
              backgroundColor: "#e9ecef",
              borderRadius: "5px"
            }}
          >
            <h4>Create Study Group</h4>
            <button
              onClick={createStudyGroup}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating..." : "Create Example Group"}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "5px",
            border: "1px solid #f5c6cb"
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Partners Display */}
      {partners.length > 0 && (
        <div>
          <h3>Study Partners ({partners.length})</h3>
          <div style={{ display: "grid", gap: "15px" }}>
            {partners.map(partner => (
              <div
                key={partner.id}
                style={{
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "5px",
                  border: "1px solid #dee2e6"
                }}
              >
                <h4>{partner.name}</h4>
                <p>
                  <strong>Email:</strong> {partner.email}
                </p>
                <p>
                  <strong>Modules:</strong> {partner.modules.join(", ")}
                </p>
                <p>
                  <strong>Rating:</strong> {partner.rating}/5
                </p>
                <p>
                  <strong>Study Sessions:</strong> {partner.totalStudySessions}
                </p>
                <p>
                  <strong>Preferences:</strong>{" "}
                  {partner.studyPreferences.join(", ")}
                </p>
                <p>
                  <strong>Availability:</strong>{" "}
                  {partner.availability.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#d1ecf1",
          borderRadius: "5px",
          border: "1px solid #bee5eb"
        }}
      >
        <h3>How to Use This Example</h3>
        <ol>
          <li>
            <strong>Setup Firebase:</strong> Make sure you have Firebase
            configured in your app
          </li>
          <li>
            <strong>Authentication:</strong> Users need to be logged in to
            access protected API endpoints
          </li>
          <li>
            <strong>API Calls:</strong> Include the Firebase ID token in the
            Authorization header
          </li>
          <li>
            <strong>Error Handling:</strong> Always handle API errors gracefully
          </li>
          <li>
            <strong>Loading States:</strong> Show loading indicators during API
            calls
          </li>
        </ol>

        <h4>Key Code Patterns:</h4>
        <ul>
          <li>
            <code>await user.getIdToken()</code> - Get the Firebase ID token
          </li>
          <li>
            <code>Authorization: Bearer {token}</code> - Include token in API
            headers
          </li>
          <li>
            <code>/api/*</code> - All API endpoints are prefixed with /api
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiExample;
