import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from "./home/home_header";
import "./login.css";

const AccountCreate = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError("Please fill out all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/create_account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uemail: email, uname: username, upassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account creation failed");
      }

      // Store user information in localStorage
      localStorage.setItem("uid", data.uid);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);

      // Show success message and redirect
      alert("Account created successfully!");
      navigate("/homepage");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Home_Header toggleOverlay={() => {}} />

      <div className="login-container">
        <div className="login-mascot">🚀</div>

        <div className="login-header">
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join Picobytes and start your coding journey</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleCreation}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <div className="login-actions">
            <button
              type="submit"
              className="login-button primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCreate;