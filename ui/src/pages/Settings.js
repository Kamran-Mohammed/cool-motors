import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Restricted from "../utils/Restricted";
import Confirmation from "../utils/Confirmation";
import Alert from "../utils/Alert";
import "./css/Settings.css";
import {
  FiArrowLeft,
  FiLock,
  FiUser,
  FiMail,
  FiTruck,
  FiLogOut,
  FiTrash2,
} from "react-icons/fi";

const Settings = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?._id) return;

      const userId = user._id;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/users/${userId}`,
          {
            withCredentials: true,
          }
        );
        setIsAdmin(response.data.data.user.role === "admin");
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user info.");
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleLogout = async () => {
    // const confirmed = window.confirm("Are you sure you want to log out?");
    setShowConfirm(false);
    // if (confirmed) {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/logout`, {
        withCredentials: true,
      });

      // alert("logged out");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    // }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Enter your password to confirm account deletion:");
    if (!password) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/users/deleteMe`,
        {
          withCredentials: true,
          data: { password }, // Send password in request body
        }
      );
      await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/logout`, {
        withCredentials: true,
      });
      setShowAlert(true);
    } catch (err) {
      alert(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  if (!authLoading && !user) {
    return <Restricted />;
  }

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="settings-container">
      <div className="inner-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
        </button>

        <div className="settings-box">
          <h2 className="settings-title">Settings</h2>

          <div
            className="settings-option"
            onClick={() => navigate("/update-password")}
          >
            <FiLock className="opt-icon" />
            Change Password
          </div>
          <div
            className="settings-option"
            onClick={() => navigate("/update-me")}
          >
            <FiUser className="opt-icon" />
            Update Profile
          </div>
          <div
            className="settings-option"
            onClick={() => navigate("/update-my-email")}
          >
            <FiMail className="opt-icon" />
            Update Email
          </div>
          {isAdmin && (
            <div
              className="settings-option"
              onClick={() => navigate("/admin/pending-vehicles-list")}
            >
              <FiTruck className="opt-icon" />
              Review Vehicles (Admin)
            </div>
          )}
          <div
            className="settings-option logout"
            onClick={() => setShowConfirm(true)}
          >
            <FiLogOut className="opt-icon" />
            Logout
          </div>
          <div className="settings-option delete" onClick={handleDeleteAccount}>
            <FiTrash2 className="opt-icon" />
            Delete My Account
          </div>
        </div>
      </div>
      {showConfirm && (
        <Confirmation
          message="Are you sure you want to logout?"
          confirmText="Logout"
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleLogout}
        />
      )}

      {showAlert && (
        <Alert
          message="Your account has been deleted successfully."
          onClose={() => {
            navigate("/");
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Settings;
