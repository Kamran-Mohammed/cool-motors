import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/VehicleDetails.css"; // Import the CSS for the modal and blur effect
import { useAuth } from "../AuthContext";
import Restricted from "../utils/Restricted";
import left from "../utils/images/left.png";
import right from "../utils/images/right.png";
import Confirmation from "../utils/Confirmation";

function PendingVehicle() {
  const { id } = useParams(); // Vehicle ID from URL
  const [vehicle, setVehicle] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for the current image index
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [showConfirm, setShowConfirm] = useState(false);
  const [decision, setDecision] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  // NEW: State to track if all images are preloaded
  const [allImagesPreloaded, setAllImagesPreloaded] = useState(false);
  // NEW: Ref to store preloaded Image objects (not directly used in JSX, but holds the data)
  const preloadedImagesRef = useRef([]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEndX(e.changedTouches[0].clientX);
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // Minimum swipe distance
    if (deltaX > threshold) {
      prevImage(); // Swipe right → show previous image
    } else if (deltaX < -threshold) {
      nextImage(); // Swipe left → show next image
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchVehicle = async () => {
      setFetchLoading(true);
      try {
        // Fetch vehicle details
        const vehicleResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/${id}`,
          {
            withCredentials: true,
          }
        );
        if (!vehicleResponse.data.data.vehicle) {
          setError("No pending vehicles");
          setFetchLoading(false);
          return;
        }
        const fetchedVehicle = vehicleResponse.data.data.vehicle;
        setVehicle(fetchedVehicle);
        // Fetch seller details if available
        if (fetchedVehicle.listedBy) {
          const sellerResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/v1/users/${fetchedVehicle.listedBy}`,
            {
              withCredentials: true,
            }
          );
          setSeller(sellerResponse.data.data.user);
        }

        // NEW: Initiate image preloading after fetching vehicle data
        if (fetchedVehicle.images && fetchedVehicle.images.length > 0) {
          let loadedCount = 0;
          preloadedImagesRef.current = []; // Clear previous preloaded images

          fetchedVehicle.images.forEach((imageUrl, index) => {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
              loadedCount++;
              preloadedImagesRef.current[index] = img; // Store the loaded image object
              if (loadedCount === fetchedVehicle.images.length) {
                setAllImagesPreloaded(true); // All images are loaded
              }
            };
            img.onerror = () => {
              // Handle image loading errors, e.g., show a placeholder
              console.warn(`Failed to load image: ${imageUrl}`);
              loadedCount++; // Still increment to count it as "attempted"
              if (loadedCount === fetchedVehicle.images.length) {
                setAllImagesPreloaded(true);
              }
            };
          });
        } else {
          // No images to preload, consider it preloaded
          setAllImagesPreloaded(true);
        }
      } catch (error) {
        if (error.response.status === 403) {
          setError("You don't have access to this page");
          setFetchLoading(false);
          return;
        }
        setError("Failed to fetch vehicle");
        console.error("Error fetching vehicle or seller details:", error);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  const getNextPendingVehicleId = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/${id}/next`,
        {
          withCredentials: true,
        }
      );
      return response.data?.data?.nextVehicle?._id || null;
    } catch (err) {
      console.error("Error fetching next pending vehicle:", err);
      return null;
    }
  };

  const handleApprove = async () => {
    if (!vehicle) return;
    setLoading(true);
    setShowConfirm(false);

    const nextVehicleId = await getNextPendingVehicleId();

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/${vehicle._id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );
      //   fetchVehicle(); // Fetch next vehicle after approval
      if (nextVehicleId) {
        navigate(`/admin/pending-vehicle/${nextVehicleId}`);
      } else {
        navigate("/admin/no-pending-vehicles"); // Fallback if no more pending vehicles exist
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleDisapprove = async () => {
    if (!vehicle) return;
    setLoading(true);
    setShowConfirm(false);

    const nextVehicleId = await getNextPendingVehicleId();

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/v1/pending-vehicles/${vehicle._id}/disapprove`,
        {
          withCredentials: true,
        }
      );
      //   fetchVehicle(); // Fetch next vehicle after disapproval
      if (nextVehicleId) {
        navigate(`/admin/pending-vehicle/${nextVehicleId}`);
      } else {
        navigate("/admin/no-pending-vehicles"); // Fallback if no more pending vehicles exist
      }
    } catch (err) {
      setError("Failed to disapprove vehicle");
    } finally {
      setLoading(false);
    }
  };

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === vehicle.images.length - 1 ? 0 : prevIndex + 1
    );
  }, [vehicle]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
    );
  }, [vehicle]);

  const openImageModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Close modal when the 'Esc' key is pressed
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "ArrowLeft") {
        prevImage();
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, nextImage, prevImage]);

  if (!authLoading && !user) {
    return <Restricted />;
  }

  if (fetchLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h2 align="center">{error}</h2>
      </div>
    );
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  // Determine the image source. If all images are preloaded, use the current image directly.
  // Otherwise, use a loading class or a placeholder.
  const currentImageSrc =
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[currentImageIndex]
      : "https://placehold.co/1200x800/e0e0e0/555555?text=No+Image"; // Fallback placeholder

  return (
    <div>
      <div
        className={`vehicle-details ${isModalOpen ? "blur-background" : ""}`}
        style={{
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.6 : 1,
          backgroundColor: "#a9f2b9",
        }}
      >
        <div
          className="image-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* NEW: Conditional rendering for loading state or preloaded image */}
          {!allImagesPreloaded && (
            <div className="image-loading-overlay">
              <div className="spinner"></div> {/* Basic spinner */}
              <p>Loading images...</p>
            </div>
          )}
          <img
            src={currentImageSrc}
            alt={`${vehicle.make} ${vehicle.model}`}
            className={`vehicle-image ${
              !allImagesPreloaded ? "loading-effect" : ""
            }`} // Add loading effect class
            style={{
              objectFit: "contain",
              // NEW: Make image invisible until preloaded if not showing overlay
              // opacity: allImagesPreloaded ? 1 : 0,
              // transition: 'opacity 0.3s ease-in-out', // Smooth fade-in
            }}
            onClick={openImageModal}
          />
          {
            <div className="image-counter">
              {currentImageIndex + 1}/{vehicle.images.length}
            </div>
          }
          {/* Previous Button */}
          {vehicle.images?.length > 1 && (
            <img
              src={left}
              alt="Previous"
              onClick={prevImage}
              className="img-nav-button left"
            />
          )}

          {/* Next Button */}
          {vehicle.images?.length > 1 && (
            <img
              src={right}
              alt="Next"
              onClick={nextImage}
              className="img-nav-button right"
            />
          )}
        </div>
        <h2
          style={{ fontSize: "28px", marginTop: "20px", marginBottom: "10px" }}
        >
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.variant && (
            <span
              style={{ fontSize: "20px", color: "#555", marginLeft: "6px" }}
            >
              ({vehicle.variant})
            </span>
          )}
        </h2>
        <h1 style={{ fontSize: "36px", color: "#333", margin: "10px 0" }}>
          ₹{vehicle.price.toLocaleString("en-IN")}
        </h1>

        <table className="vehicle-details-table">
          <tbody>
            {isMobileScreen ? (
              // Mobile View: 2 Columns (Property | Value)
              <>
                <tr>
                  <td>
                    <strong>Fuel Type:</strong>
                  </td>
                  <td>{vehicle.fuelType}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Transmission:</strong>
                  </td>
                  <td>{vehicle.transmission}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Odometer:</strong>
                  </td>
                  <td>{vehicle.odometer.toLocaleString("en-IN")} km</td>
                </tr>
                <tr>
                  <td>
                    <strong>No. of Owners:</strong>
                  </td>
                  <td>{vehicle.ownership}</td>
                </tr>
                <tr>
                  <td>
                    <strong>State:</strong>
                  </td>
                  <td>{vehicle.state ? vehicle.state : "--"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Location:</strong>
                  </td>
                  <td>{vehicle.location}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Engine:</strong>
                  </td>
                  <td>
                    {!vehicle.engineDisplacement && !vehicle.engineType
                      ? "--"
                      : ""}
                    {vehicle.engineDisplacement
                      ? `${vehicle.engineDisplacement}L`
                      : ""}{" "}
                    {vehicle.engineType ? vehicle.engineType : ""}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Date Listed:</strong>
                  </td>
                  <td>
                    {vehicle.createdAt
                      ? new Date(vehicle.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "--"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Seller:</strong>
                  </td>
                  <td>
                    {seller ? (
                      <Link to={`/user/${seller._id}`}>{seller.name}</Link>
                    ) : (
                      "Loading seller details..."
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Description:</strong>
                  </td>
                  <td>
                    {vehicle.description
                      ? vehicle.description.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            <br />
                          </span>
                        ))
                      : "--"}
                  </td>
                </tr>
              </>
            ) : (
              // Desktop View: 4 Columns (Property | Value | Property | Value)
              <>
                <tr>
                  <td>
                    <strong>Fuel Type:</strong>
                  </td>
                  <td>{vehicle.fuelType}</td>
                  <td>
                    <strong>Transmission:</strong>
                  </td>
                  <td>{vehicle.transmission}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Odometer:</strong>
                  </td>
                  <td>{vehicle.odometer.toLocaleString("en-IN")} km</td>
                  <td>
                    <strong>No. of Owners:</strong>
                  </td>
                  <td>{vehicle.ownership}</td>
                </tr>
                <tr>
                  <td>
                    <strong>State:</strong>
                  </td>
                  <td>{vehicle.state ? vehicle.state : "--"}</td>
                  <td>
                    <strong>Location:</strong>
                  </td>
                  <td>{vehicle.location}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Engine:</strong>
                  </td>
                  <td>
                    {!vehicle.engineDisplacement && !vehicle.engineType
                      ? "--"
                      : ""}
                    {vehicle.engineDisplacement
                      ? `${vehicle.engineDisplacement}L`
                      : ""}{" "}
                    {vehicle.engineType ? vehicle.engineType : ""}
                  </td>
                  <td>
                    <strong>Date Listed:</strong>
                  </td>
                  <td>
                    {vehicle.createdAt
                      ? new Date(vehicle.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "--"}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Seller:</strong>
                  </td>
                  <td colSpan="3">
                    {seller ? (
                      <Link to={`/user/${seller._id}`}>{seller.name}</Link>
                    ) : (
                      "Loading seller details..."
                    )}
                  </td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: "top" }}>
                    <strong>Description:</strong>
                  </td>
                  <td colSpan="3">
                    {vehicle.description
                      ? vehicle.description.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            <br />
                          </span>
                        ))
                      : "--"}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <div className="action-buttons">
          <button
            onClick={() => {
              setShowConfirm(true);
              setDecision("approve");
            }}
            className="approve-btn"
            disabled={loading}
          >
            {loading ? "Loading" : "Approve"}
          </button>
          <button
            onClick={() => {
              setShowConfirm(true);
              setDecision("disapprove");
            }}
            className="disapprove-btn"
            disabled={loading}
          >
            {loading ? "Loading" : "Disapprove"}
          </button>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div
          className="modal"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <span className="close" onClick={closeModal}>
            &times;
          </span>
          {
            <div className="image-counter-modal">
              {currentImageIndex + 1}/{vehicle.images.length}
            </div>
          }
          {/* Previous Button */}
          {vehicle.images?.length > 1 && (
            <img
              src={left}
              alt="Previuos"
              onClick={prevImage}
              className="img-nav-button left"
            />
          )}
          {/* <img
            className="modal-content"
            src={vehicle.images[currentImageIndex]}
            alt={`${vehicle.make} ${vehicle.model}`}
          /> */}
          {/* NEW: Conditional rendering for modal image loading */}
          {!allImagesPreloaded && (
            <div className="modal-image-loading-overlay">
              <div className="spinner"></div>
              <p>Loading image...</p>
            </div>
          )}
          <img
            className={`modal-content ${
              !allImagesPreloaded ? "loading-effect" : ""
            }`} // Add loading effect class
            src={currentImageSrc} // Use currentImageSrc for consistent loading logic
            alt={`${vehicle.make} ${vehicle.model}`}
            // style={{ opacity: allImagesPreloaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }} // Optional fade-in
          />
          {/* Next Button */}
          {vehicle.images?.length > 1 && (
            <img
              src={right}
              alt="Next"
              onClick={nextImage}
              className="img-nav-button right"
            />
          )}
        </div>
      )}
      {showConfirm && (
        <Confirmation
          message={`Are you sure you want to ${decision} this vehicle?`}
          confirmText="Yes"
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            decision === "approve" ? handleApprove() : handleDisapprove();
          }}
        />
      )}
    </div>
  );
}

export default PendingVehicle;
