// src/components/HeroSection.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import slugify from "slugify";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./css/HeroSection.css";

const HeroSection = () => {
  const [vehicles, setVehicles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRandomVehicles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/v1/vehicles/featured?limit=10`,
          { withCredentials: true }
        );
        setVehicles(response.data.data.vehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };

    fetchRandomVehicles();
  }, []);

  return (
    <div className="hero-carousel">
      {vehicles.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          // pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          className="hero-swiper"
        >
          {vehicles.map((vehicle) => {
            const slug = slugify(
              `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              { lower: true, strict: true }
            );
            return (
              <SwiperSlide key={vehicle._id}>
                <div
                  className="hero-slide"
                  onClick={() => navigate(`/vehicle/${vehicle._id}/${slug}`)}
                >
                  <div className="hero-images">
                    {/* Main image */}
                    <div className="hero-main">
                      <div className="hero-featured">FEATURED</div>
                      <img
                        src={
                          vehicle.images && vehicle.images.length > 0
                            ? vehicle.images[0]
                            : "placeholder.jpg"
                        }
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="hero-image"
                      />
                      <div className="hero-text-overlay">
                        <h2>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h2>
                        <h1>₹{vehicle.price.toLocaleString("en-IN")}</h1>
                        <p>{vehicle.odometer.toLocaleString("en-IN")} km</p>
                        <p>
                          {vehicle.location}, {vehicle.state}
                        </p>
                      </div>
                    </div>

                    {/* Side images */}
                    <div className="hero-side">
                      <img
                        src={
                          vehicle.images && vehicle.images.length > 1
                            ? vehicle.images[1]
                            : "placeholder.jpg"
                        }
                        alt="Extra view"
                        className="hero-side-img"
                      />
                      <img
                        src={
                          vehicle.images && vehicle.images.length > 2
                            ? vehicle.images[2]
                            : "placeholder.jpg"
                        }
                        alt="Extra view"
                        className="hero-side-img"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <p className="loading-text">Loading cars...</p>
      )}
    </div>
  );
};

export default HeroSection;
