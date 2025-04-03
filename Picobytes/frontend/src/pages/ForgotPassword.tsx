import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const navigate = useNavigate()

  const change_password = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/update_password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uname: Username, upassword: Password }),
        }
      );
      const data = await response.json();

      console.log("Success: " + data.success);

    } catch (err: any) {
      console.log(err.message);
    } finally {
      navigate("/")
    }
  };

  return (
    <>
      <div>ForgotPassword</div>
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          id="username"
          className="form-input"
          type="text"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
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
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
        />
      </div>

      <button onClick={change_password}>Submit</button>
    </>
  );
};

export default ForgotPassword;
