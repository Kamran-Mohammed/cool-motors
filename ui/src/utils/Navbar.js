import "./Navbar.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserIdFromToken } from "./jwtDecode";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setUserId(getUserIdFromToken(token));
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="nav-links">
        <Link to="/" className="nav-link">
          HOME
        </Link>
        <Link to="/search" className="nav-link">
          Search
        </Link>
      </div>
      {isLoggedIn ? (
        <div
          className="user-menu"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="user-menu-title">User Menu</div>
          {isHovered && (
            <div className="dropdown-menu">
              <Link to={`/user/${userId}`} className="dropdown-link">
                My Profile
              </Link>
              <Link to="/list" className="dropdown-link">
                List Vehicle
              </Link>
              <div onClick={handleLogout} className="dropdown-link logout">
                Logout
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="nav-link">
          Login
        </Link>
      )}
    </header>
  );
};

export default Navbar;