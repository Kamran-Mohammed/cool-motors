import { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick"; // Import the Slider component
import { Link } from "react-router-dom"; // To link to vehicle details
import "./css/VehicleCarousel.css"; // Import its specific CSS
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const VehicleCarousel = () => {
  const [carouselVehicles, setCarouselVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarouselVehicles = async () => {
      try {
        // Fetch 5 random vehicles for the carousel
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/random?limit=5`, // Limit to 5 vehicles
          { withCredentials: true }
        );
        setCarouselVehicles(response.data.data.vehicles);
      } catch (err) {
        console.error("Error fetching carousel vehicles:", err);
        setError("Failed to load carousel vehicles.");
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselVehicles();
  }, []);

  // react-slick settings
  const settings = {
    dots: true, // Show navigation dots
    infinite: true, // Loop the carousel
    speed: 500, // Transition speed
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1, // Scroll one slide at a time
    autoplay: true, // Auto-play the carousel
    autoplaySpeed: 5000, // Time between slides (5 seconds)
    fade: true, // Fade effect instead of slide
    cssEase: "linear", // Smooth transition
    arrows: true, // Show navigation arrows
    // Optional responsive settings if needed
    responsive: [
      {
        breakpoint: 768, // Apply below 768px
        settings: {
          arrows: false, // Hide arrows on mobile
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="carousel-loading">
        <div className="spinner"></div>
        <p>Loading featured vehicles...</p>
      </div>
    );
  }

  if (error) {
    return <div className="carousel-error">{error}</div>;
  }

  if (carouselVehicles.length === 0) {
    return (
      <div className="carousel-no-data">No featured vehicles available.</div>
    );
  }

  return (
    <div className="vehicle-carousel-container">
      <Slider {...settings}>
        {carouselVehicles.map((vehicle) => (
          <div key={vehicle._id} className="carousel-slide">
            <Link to={`/vehicle/${vehicle._id}`} className="carousel-link">
              <img
                src={
                  vehicle.images && vehicle.images.length > 0
                    ? vehicle.images[0]
                    : "https://placehold.co/1920x1080/e0e0e0/555555?text=No+Image"
                }
                alt={`${vehicle.make} ${vehicle.model}`}
                className="carousel-image"
              />
              <div className="carousel-details-overlay">
                <h2 className="carousel-title">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                <h1 className="carousel-price">
                  ₹{vehicle.price.toLocaleString("en-IN")}
                </h1>
                <p className="carousel-odometer">
                  {vehicle.odometer.toLocaleString("en-IN")} km
                </p>
                <p className="carousel-location">
                  {vehicle.location}, {vehicle.state}
                </p>
                <button className="carousel-view-details-btn">
                  View Details
                </button>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default VehicleCarousel;
