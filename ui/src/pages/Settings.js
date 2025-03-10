import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Restricted from "../utils/Restricted";
import Confirmation from "../utils/Confirmation";
import Alert from "../utils/Alert";

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
          `http://localhost:5001/api/v1/users/${userId}`,
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

  const handleUpdatePassword = () => {
    navigate("/update-password");
  };

  const handleUpdateProfile = () => {
    navigate("/update-me");
  };

  const handleUpdateEmail = () => {
    navigate("/update-my-email");
  };

  const handleLogout = async () => {
    // const confirmed = window.confirm("Are you sure you want to log out?");
    setShowConfirm(false);
    // if (confirmed) {
    try {
      await axios.get("http://localhost:5001/api/v1/users/logout", {
        withCredentials: true,
      });

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
    }
    // }
  };

  const handleReviewVehicles = () => {
    navigate("/admin/review-vehicles");
  };

  const handleDeleteAccount = async () => {
    // const firstName = user?.name?.split(" ")[0] || "your";
    // const confirmationText = `delete ${firstName}'s account`;
    // const userInput = prompt(
    //   `To confirm account deletion, type: "${confirmationText}"`
    // );

    // if (userInput !== confirmationText) {
    //   alert("Account deletion canceled. The input did not match.");
    //   return;
    // }
    const password = prompt("Enter your password to confirm account deletion:");
    if (!password) {
      // alert("Account deletion canceled. Password is required.");
      return;
    }

    try {
      await axios.delete("http://localhost:5001/api/v1/users/deleteMe", {
        withCredentials: true,
        data: { password }, // Send password in request body
      });
      await axios.get("http://localhost:5001/api/v1/users/logout", {
        withCredentials: true,
      });
      setShowAlert(true);
      // alert("Your account has been deleted successfully.");
      // navigate("/");
      // window.location.reload();
    } catch (err) {
      // console.error("Error deleting account:", err);
      alert(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  // useEffect(() => {
  if (!authLoading && !user) {
    // navigate("/restricted");
    return <Restricted />;
  }
  // }, [user, authLoading, navigate]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Settings</h2>
      <button
        onClick={handleUpdatePassword}
        style={{
          display: "block",
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Change Password
      </button>
      <button
        onClick={handleUpdateProfile}
        style={{
          display: "block",
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Update Profile
      </button>
      <button
        onClick={handleUpdateEmail}
        style={{
          display: "block",
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Update Email
      </button>
      {isAdmin && (
        <button
          onClick={handleReviewVehicles}
          style={{
            display: "block",
            margin: "10px 0",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Review Vehicles (Admin Only)
        </button>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          display: "block",
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      <button
        onClick={handleDeleteAccount}
        style={{
          display: "block",
          margin: "10px 0",
          padding: "10px 20px",
          backgroundColor: "#ff4500",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Delete My Account
      </button>
      {showConfirm && (
        <Confirmation
          message="Are you sure you want to logout?"
          confirmText="Logout"
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => handleLogout()}
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
