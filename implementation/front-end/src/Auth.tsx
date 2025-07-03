import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { apiPost } from "./request";

const Auth = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>(""); // For displaying error messages
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate username and password length
    if (username.length < 4) {
      setError("Username must be at least 4 characters long.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(""); // Clear previous error messages

    try {
      // Send the POST request to /users/login
      const response = await apiPost("/users/login", { username, password });
      console.log("Login successful:", response);

      // check if "redirect" search param exists
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");
      if (redirect) {
        // Clear the search params
        // Redirect to the URL specified in the "redirect" search param
        location.href = location.protocol + "//" + location.host + redirect;
        return;
      }

      // Navigate to the spreadsheet page on success
      location.pathname = "/spreadsheet";
    } catch (err) {
      const typedError = err as Error;
      console.error("Login failed:", typedError.message);
      setError(typedError.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="auth-page">
      <div className="spreadsheet-title">
        Spreadsheet <span className="created-title">created by US</span>
      </div>

      <div className="auth-container">
        <h1>Login or Register</h1>
        <p className="description">
          We will automatically check whether your account is active or not. If
          you are active, we will log you into the spreadsheet. If not, we will
          sign you up for it.
        </p>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Display error messages */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
