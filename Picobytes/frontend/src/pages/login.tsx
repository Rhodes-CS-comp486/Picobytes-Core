import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from "./home/home_header";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uname: username, upassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid username or password");
      }

      // Store user information in localStorage
      console.log("Login successful, UID:", data.uid);
      localStorage.setItem("uid", data.uid);
      localStorage.setItem("username", username);

      // Check if user is admin and set in localStorage if needed
      if (data.is_admin) {
        localStorage.setItem("isAdmin", "true");
      }

      // Navigate to homepage on successful login
      navigate("/homepage");
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Home_Header toggleOverlay={() => {}} />

      <div className="login-container">
        <div className="login-mascot">🤖</div>

        <div className="login-header">
          <h1 className="login-title">Welcome to Picobytes</h1>
          <p className="login-subtitle">
            Sign in to continue your learning journey
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <a href="/forgot_password">Forgot your password?</a>

          <div className="login-actions">
            <button
              type="button"
              className="login-button secondary"
              onClick={() => navigate("/accountcreate")}
              disabled={loading}
            >
              Create Account
            </button>

            <button
              type="submit"
              className="login-button primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>
            Need help? <a href="mailto:kugeles@rhodes.edu">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
