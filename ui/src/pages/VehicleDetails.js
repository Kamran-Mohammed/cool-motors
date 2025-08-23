import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import slugify from "slugify";
import "./css/VehicleDetails.css"; // Import the CSS for the modal and blur effect
import { useAuth } from "../AuthContext";
import left from "../utils/images/left.png";
import right from "../utils/images/right.png";
import whatsApp from "../utils/images/WhatsAppButton.png";
import heart from "../utils/images/heart.png";
import fullHeart from "../utils/images/full-heart.png";
import { isMobile } from "../utils/tools";
import { FaShareAlt } from "react-icons/fa";

function VehicleDetails() {
  const { id, slug } = useParams(); // Vehicle ID from URL
  const [vehicle, setVehicle] = useState(null);
  const [seller, setSeller] = useState(null);
  const [liked, setLiked] = useState(false); // State for like status
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // State for the current image index
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  // NEW: State to track the number of active touches at the start of a touch event
  const [touchCountStart, setTouchCountStart] = useState(0);
  // NEW: State to track if all images are preloaded
  const [allImagesPreloaded, setAllImagesPreloaded] = useState(false);
  // NEW: Ref to store preloaded Image objects (not directly used in JSX, but holds the data)
  const preloadedImagesRef = useRef([]);
  // NEW: State to control arrow visibility on hover (desktop only)
  const [showNavButtons, setShowNavButtons] = useState(false);
  const mainImageRef = useRef(null);
  const [mainImageHeight, setMainImageHeight] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchCountStart(e.touches.length); // Record number of touches
  };

  const handleTouchEnd = (e) => {
    // Only proceed if it was a single-finger touch gesture
    if (touchCountStart !== 1 || e.changedTouches.length !== 1) {
      setTouchCountStart(0); // Reset touch count
      return; // Ignore multi-touch or non-single-finger release
    }

    setTouchEndX(e.changedTouches[0].clientX);
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50; // Minimum swipe distance
    if (deltaX > threshold) {
      prevImage(); // Swipe right → show previous image
    } else if (deltaX < -threshold) {
      nextImage(); // Swipe left → show next image
    }
    setTouchCountStart(0);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
      if (mainImageRef.current) {
        setMainImageHeight(mainImageRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mainImageRef.current) {
      setMainImageHeight(mainImageRef.current.offsetHeight);
    }
  }, [currentImageIndex, allImagesPreloaded]); // Recalculate if image changes or loads

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        // Fetch vehicle details
        const vehicleResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${id}`,
          {
            withCredentials: true,
          }
        );
        const fetchedVehicle = vehicleResponse.data.data.vehicle;
        setVehicle(fetchedVehicle);

        // const correctSlug = slugify(
        //   `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        //   {
        //     lower: true, // convert to lowercase
        //     strict: true, // strip special chars except hyphens
        //   }
        // );

        // if (slug !== correctSlug) {
        //   navigate(`/vehicle/${id}/${correctSlug}`, { replace: true });
        //   return; // stop here to avoid double state updates
        // }

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
        console.error("Error fetching vehicle or seller details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id, slug, navigate]);

  useEffect(() => {
    const checkIfVehicleLiked = async () => {
      if (!vehicle || !vehicle._id || !user) return; // Exit if no vehicle ID or user is available
      try {
        // Check if the vehicle is liked using the new API endpoint
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${vehicle._id}/likes/is-liked`,
          {
            withCredentials: true,
          }
        );
        setLiked(response.data.data.isLiked);
      } catch (error) {
        console.error("Error checking if vehicle is liked:", error);
      }
    };
    checkIfVehicleLiked();
  }, [vehicle, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      if (window.confirm("Do you want to Login to like this vehicle?")) {
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      }
      return;
    }
    try {
      if (liked) {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${id}/likes`,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/${id}/likes`,
          {},
          {
            withCredentials: true,
          }
        );
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error updating like status:", error);
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model} for sale on Autofinds.in`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        console.log("Content shared successfully");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert(`You can share this link: ${shareUrl}`);
    }
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

  if (loading) {
    return <div>Loading...</div>;
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
      >
        <div className="main-image-section">
          <div
            className="image-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            // NEW: Mouse events for desktop hover effect
            onMouseEnter={() => !isMobileScreen && setShowNavButtons(true)}
            onMouseLeave={() => !isMobileScreen && setShowNavButtons(false)}
            ref={mainImageRef} // Assign ref to the main image container
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
              }}
              onClick={openImageModal}
            />
            {/* <img
              src={
                vehicle.images && vehicle.images.length > 0
                  ? vehicle.images[currentImageIndex]
                  : "placeholder.jpg"
              }
              alt={`${vehicle.make} ${vehicle.model}`}
              className="vehicle-image"
              style={{
                objectFit: "contain",
              }}
              onClick={openImageModal}
            /> */}
            <button onClick={handleShare} className="share-button">
              <FaShareAlt style={{ width: "30px", height: "30px" }} />{" "}
              {/* Icon size matching heart */}
            </button>
            <button onClick={handleLikeToggle} className="like-button">
              <img
                src={liked ? fullHeart : heart}
                alt="Like"
                // className="heart-icon"
                style={{ width: "30px", height: "30px" }}
              />
            </button>
            {
              <div className="image-counter">
                {currentImageIndex + 1}/{vehicle.images.length}
              </div>
            }
            {/* Previous Button - MODIFIED: Conditional class for visibility */}
            {vehicle.images?.length > 1 && (
              <img
                src={left}
                alt="Previous"
                onClick={prevImage}
                className={`img-nav-button left ${
                  showNavButtons || isMobileScreen ? "visible" : ""
                }`}
              />
            )}

            {/* Next Button - MODIFIED: Conditional class for visibility */}
            {vehicle.images?.length > 1 && (
              <img
                src={right}
                alt="Next"
                onClick={nextImage}
                className={`img-nav-button right ${
                  showNavButtons || isMobileScreen ? "visible" : ""
                }`}
              />
            )}

            {/* NEW: Image Navigation Dots */}
            {vehicle.images?.length > 1 && (
              <div className="image-dots-container">
                {vehicle.images.map((_, index) => (
                  <span
                    key={index}
                    className={`image-dot ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  ></span>
                ))}
              </div>
            )}
          </div>
          <div
            className="thumbnail-images-container"
            style={{ height: mainImageHeight > 0 ? `${mainImageHeight}px` : 'auto' }}
          >
            {vehicle.images.length > 0 ? (
              // Slice images to show current, next, and next-next, wrapping around
              Array.from({ length: Math.min(vehicle.images.length, 3) }).map(
                (_, i) => {
                  const imageIndex = (currentImageIndex + i) % vehicle.images.length;
                  const image = vehicle.images[imageIndex];
                  const isLastThumbnail = i === 2 && vehicle.images.length > 3;

                  return (
                    <div
                      key={imageIndex}
                      className={`thumbnail-wrapper ${
                        imageIndex === currentImageIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentImageIndex(imageIndex)}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${imageIndex + 1}`}
                        className="thumbnail-image"
                      />
                      {isLastThumbnail && (
                        <div
                          className="more-photos-overlay"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent setCurrentImageIndex from firing
                            openImageModal();
                          }}
                        >
                          <span className="more-photos-text">
                            +{vehicle.images.length - (i + 1)} More Photos
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
              )
            ) : (
              <div className="thumbnail-wrapper no-image">
                <img
                  src="https://placehold.co/150x100/e0e0e0/555555?text=No+Image"
                  alt="No Image"
                  className="thumbnail-image"
                />
              </div>
            )}
          </div>
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
        {/* <p>{vehicle.variant ? vehicle.variant : ""}</p> */}
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
                    {/* {seller && seller.phoneNumber && (
                      <a
                        href={
                          isMobile()
                            ? `whatsapp://send?phone=${seller.phoneNumber}&text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})`
                            : `https://wa.me/${seller.phoneNumber}?text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={whatsApp}
                          alt="WhatsApp Chat"
                          className="whatsapp-icon"
                        />
                      </a>
                    )} */}
                    {seller && seller.phoneNumber && (
                      <a
                        href={
                          isMobile()
                            ? `whatsapp://send?phone=${seller.phoneNumber}&text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})%0A${window.location.origin}/vehicle/${vehicle._id}/${slug}`
                            : `https://wa.me/${seller.phoneNumber}?text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})%0A${window.location.origin}/vehicle/${vehicle._id}/${slug}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={whatsApp}
                          alt="WhatsApp Chat"
                          className="whatsapp-icon"
                        />
                      </a>
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
                    {seller && seller.phoneNumber && (
                      <a
                        href={
                          isMobile()
                            ? `whatsapp://send?phone=${seller.phoneNumber}&text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})%0A${window.location.origin}/vehicle/${vehicle._id}/${slug}`
                            : `https://wa.me/${seller.phoneNumber}?text=I'm%20interested%20in%20your%20car%20for%20sale%20(${vehicle.make}%20${vehicle.model})%0A${window.location.origin}/vehicle/${vehicle._id}/${slug}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={whatsApp}
                          alt="WhatsApp Chat"
                          className="whatsapp-icon"
                        />
                      </a>
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
              className="img-nav-button left modal-img-nav-button"
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
              className="img-nav-button right modal-img-nav-button"
            />
          )}
          {/* NEW: Image Navigation Dots in Modal */}
          {vehicle.images?.length > 1 && (
            <div className="image-dots-container modal-dots-container">
              {vehicle.images.map((_, index) => (
                <span
                  key={index}
                  className={`image-dot ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                ></span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VehicleDetails;
