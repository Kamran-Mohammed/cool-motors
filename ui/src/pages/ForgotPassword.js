import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import Link for navigation
import axios from "axios";
import "./css/ForgotPassword.css"; // Add your styles here
import Alert from "../utils/Alert";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/forgotPassword`,
        { email },
        {
          withCredentials: true,
        }
      );
      setMessage(response.data.message || "Reset link sent to your email.");
      setError(""); // Clear any previous errors
      setShowAlert(true);
    } catch (err) {
      setError(err.response.data.message || "Something went wrong.");
      setMessage(""); // Clear success message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form
        className="forgot-password-form"
        onSubmit={handleSubmit}
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div className="form-group">
          <label htmlFor="email">Enter your email address:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="forgot-password-button"
          disabled={loading}
        >
          {loading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>

      {/* {message && <p className="success-message">{message}</p>} */}
      {error && <p className="error-message">{error}</p>}
      {showAlert && <Alert message={message} onClose={() => navigate("/")} />}
    </div>
  );
}

export default ForgotPassword;
