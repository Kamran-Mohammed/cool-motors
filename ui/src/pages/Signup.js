// src/Signup.js
import "./css/Signup.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import eye from "../utils/images/eye.svg";
import eyeOff from "../utils/images/eye-off.svg";
import Alert from "../utils/Alert";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [success, setSuccess] = useState("");
  const { user, loading: authLoading } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "password") setPassword(value);
    if (name === "passwordConfirm") setPasswordConfirm(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/signup`,
        formData,
        {
          withCredentials: true,
        }
      );
      setSuccess("Signup successful!");
      setFormData({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
      });
      setError("");

      //uncomment the next line(after email gicchi is solved)
      // setShowAlert(true);

      //comment the next two lines (after email gicchi is solved)
      navigate("/"); // Redirect to home page after login
      window.location.reload(); // Refresh the page after login
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setPassword("");
      setPasswordConfirm("");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      alert("You are already logged in.");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="signup-wrapper">
      <h2 className="signup-title">Create Account</h2>
      <form
        onSubmit={handleSubmit}
        className="signup-form"
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="signup-input"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          required
          className="signup-input"
        />
        <div className="signup-password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="signup-input"
          />
          <button
            type="button"
            className="signup-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img src={showPassword ? eye : eyeOff} alt="Toggle Password" />
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="passwordConfirm"
          value={passwordConfirm}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          className="signup-input"
        />
        <div className="signup-phone-wrapper">
          <span className="signup-phone-code">+91</span>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            maxLength="10"
            className="signup-phone-input"
            style={{ marginBottom: "0px" }}
          />
        </div>
        <small
          style={{
            marginTop: "0px",
            display: "block",
            color: "#666",
            // marginTop: "0px",
          }}
        >
          Please enter a phone number that's available on WhatsApp.
        </small>

        <button type="submit" disabled={loading} className="signup-submit-btn">
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      {error && <p className="signup-error">{error}</p>}
      {success && <p className="signup-success">{success}</p>}

      <div className="signup-footer">
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      {showAlert && (
        <Alert
          message="A verification link has been sent to you. Please visit it to verify your email."
          onClose={() => {
            navigate("/");
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default Signup;
