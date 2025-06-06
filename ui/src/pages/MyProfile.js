import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import Link for navigation
import axios from "axios";
import { useAuth } from "../AuthContext";
import VehicleCard from "../utils/VehicleCard";
import Restricted from "../utils/Restricted";

function MyProfile() {
  const [username, setUsername] = useState("");
  const { user, loading: authLoading } = useAuth();
  const [listedVehicles, setListedVehicles] = useState([]);
  const [likedVehicles, setLikedVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState("listed");
  const navigate = useNavigate();
  const [vehicleToDelete, setVehicleToDelete] = useState(null); // Track the vehicle to be deleted
  const [showModal, setShowModal] = useState(false); // Control the modal visibility

  useEffect(() => {
    if (!user?._id) return;

    const userId = user._id;

    const fetchUserDetails = async () => {
      try {
        const [userRes, listedRes, likedRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/v1/users/${userId}`, {
            withCredentials: true,
          }),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/users/${userId}/vehicles`,
            {
              withCredentials: true,
            }
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/users/${userId}/likes`,
            {
              withCredentials: true,
            }
          ),
        ]);

        setUsername(userRes.data.data.user.name);
        setListedVehicles(listedRes.data.data.vehicles);
        setLikedVehicles(likedRes.data.data.likedVehicles);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserDetails();
  }, [user]); // Depend on `user`, so it fetches data when `user` updates

  const handleDelete = async (vehicleId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicleId}`,
        {
          withCredentials: true,
        }
      );
      setListedVehicles((prevVehicles) =>
        prevVehicles.filter((vehicle) => vehicle._id !== vehicleId)
      );
      setShowModal(false); // Close modal after deletion
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const openModal = (vehicleId) => {
    setVehicleToDelete(vehicleId); // Set the vehicle to be deleted
    setShowModal(true); // Open modal
  };

  const closeModal = () => {
    setVehicleToDelete(null); // Clear the vehicle to delete
    setShowModal(false); // Close modal
  };

  // useEffect(() => {
  if (!authLoading && !user) {
    // navigate("/restricted");
    return <Restricted />;
  }
  // }, [user, authLoading, navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>{username ? `${username}'s Profile (You)` : "My Profile"}</h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setActiveTab("listed")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "listed" ? "#007bff" : "#f0f0f0",
            color: activeTab === "listed" ? "#fff" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Listed Vehicles
        </button>
        <button
          onClick={() => setActiveTab("liked")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "liked" ? "#007bff" : "#f0f0f0",
            color: activeTab === "liked" ? "#fff" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Liked Vehicles
        </button>
      </div>

      {/* Show the active tab's content */}
      {activeTab === "liked" ? (
        <div>
          {likedVehicles.length === 0 ? (
            <p>No Liked Vehicles</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
              }}
            >
              {likedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {listedVehicles.length === 0 ? (
            <p>No Listed Vehicles</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
              }}
            >
              {listedVehicles.map((vehicle) => (
                <div key={vehicle._id}>
                  <VehicleCard vehicle={vehicle} />
                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                  >
                    <button
                      onClick={() => openModal(vehicle._id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = `/edit/${vehicle._id}`)
                      }
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Are you sure?</h3>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleDelete(vehicleToDelete)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
