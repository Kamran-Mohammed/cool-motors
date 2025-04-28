import React from "react";
import { Link } from "react-router-dom";
import "./css/Footer.css"; // Create this CSS file for styling
import { isMobile } from "./tools";
import whatsApp from "./images/WhatsAppButton.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact Us</h3>
          {/* <p>Have any feedback or suggestions? We'd love to hear from you!</p> */}
          <p>
            Email: <strong>kamran@autofinds.in</strong>
          </p>
          <p>
            Phone: <strong>+91 97035 88400</strong>
          </p>
          <a
            href={
              isMobile()
                ? `whatsapp://send?phone=+919703588400&text=I%20have%20some%20feedback/suggestions`
                : `https://wa.me/+919703588400?text=I%20have%20some%20feedback/suggestions`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={whatsApp} alt="WhatsApp Chat" className="whatsapp-icon" />
          </a>
          <p className="footer-feedback-note">
            We’d love to hear your feedback or suggestions!
          </p>
          {/* <p>Address: 123, Main Street, City, Country</p> */}
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/" className="footer-link">
            Home
          </Link>
          <Link to="/search" className="footer-link">
            Search
          </Link>
          <Link to="/list" className="footer-link">
            List Vehicle
          </Link>
          <Link to="/settings" className="footer-link">
            Settings
          </Link>
        </div>

        {/* <div className="footer-section">
          <h3>Follow Us</h3>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Facebook
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Twitter
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Instagram
          </a>
        </div> */}
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Auto Finds. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
