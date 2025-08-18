import "./css/Navbar.css";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import userIcon from "./images/user.png";
// import plusIcon from "./images/plus.png";
// import AFSmall from "./images/af_small_logo.png";
import AFLogoSBS from "./images/af_logo_sbs.png";
import { FiSearch, FiPlus } from "react-icons/fi";

const Navbar = () => {
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleHamburger = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsHamburgerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSellClick = (e) => {
    e.preventDefault();

    if (!user) {
      if (window.confirm("Do you want to Login to list your vehicle?")) {
        navigate(`/login?redirect=/list`);
      }
    } else {
      navigate("/list");
    }
  };

  return (
    <header className="header">
      <div className="nav-left">
        <Link to="/" className="home-link">
          <img src={AFLogoSBS} className="logo-large" alt="Logo Large" />
          {/* <img src={AFSmall} className="logo-small" alt="Logo Small" /> */}
        </Link>
      </div>

      <div className="nav-center">
        {/* <button className="list-vehicle-btn" onClick={handleSellClick}>
          <img src={plusIcon} alt="List Vehicle" className="plus-icon" />
          <span>Sell</span>
        </button> */}
        <button className="list-vehicle-btn" onClick={handleSellClick}>
          <FiPlus className="plus-icon" />
          <span>Sell</span>
        </button>
      </div>

      <div className="nav-right">
        <Link to="/search" className="search-link">
          <FiSearch className="search-icon" />
          <span className="search-text">Search</span>
        </Link>
        {user ? (
          <div className="user-menu" ref={dropdownRef}>
            <div className="user-menu-title" onClick={toggleDropdown}>
              <img src={userIcon} alt="User Icon" className="user-icon" />
              {user.name || "User Menu"}
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/my-vehicles" className="dropdown-link">
                  My Vehicles
                </Link>
                <Link to="/liked-vehicles" className="dropdown-link">
                  Liked Vehicles
                </Link>
                <Link to="/settings" className="dropdown-link">
                  Settings
                </Link>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}
        <div
          className="guest-menu"
          onClick={toggleHamburger}
          ref={hamburgerRef}
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {isHamburgerOpen && (
            <div className="dropdown-menu">
              {user && (
                <Link to="/my-vehicles" className="dropdown-link">
                  My Vehicles
                </Link>
              )}
              {user && (
                <Link to="/liked-vehicles" className="dropdown-link">
                  Liked Vehicles
                </Link>
              )}
              {user && (
                <Link to="/settings" className="dropdown-link">
                  Settings
                </Link>
              )}
              {!user && (
                <Link to="/login" className="dropdown-link">
                  Login
                </Link>
              )}
              <div className="dropdown-link" onClick={handleSellClick}>
                Sell
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
