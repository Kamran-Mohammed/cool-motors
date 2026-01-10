import React from "react";
import "./css/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-content">
        <h1 className="about-us-title">About AutoFinds</h1>

        <section className="about-section">
          <p>
            Over the past few years, car enthusiasm in India has grown rapidly,
            but the places to buy and sell enthusiast cars haven't really
            evolved with it. Most enthusiast cars are still traded through
            Instagram pages, WhatsApp groups, Facebook posts, or word of mouth.
            While these platforms work, they're fragmented, hard to search, and
            not built specifically for cars.
          </p>
          <p>AutoFinds was created to solve that problem.</p>
          <p>
            Autofinds.in is a dedicated marketplace built only for car
            enthusiasts: a single place where interesting, rare, modified,
            exotic, vintage, and special cars can be discovered, listed, and
            bought with ease.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Mean by "Enthusiast Cars"</h2>
          <p>
            At AutoFinds, "enthusiast" doesn't mean only supercars or exotics.
          </p>
          <p>
            Yes, you'll find cars like Rolls-Royce, Lamborghini, and other
            high-end machines here but that's not it.
          </p>
          <p>We also welcome:</p>
          <ul className="features-list">
            <li>Tastefully modified cars</li>
            <li>Rare or discontinued models</li>
            <li>Vintage and classic vehicles</li>
            <li>Performance-oriented or enthusiast-loved cars</li>
            <li>
              Extremely clean, well-maintained examples of everyday cars
              <br />
              (for example, a low-odometer Maruti 800, or a pristine old Honda)
            </li>
          </ul>
          <p>
            If a car is interesting, special, or genuinely loved, it belongs
            here.
          </p>
        </section>

        <section className="about-section">
          <h2>Why AutoFinds Is Different</h2>
          <p>
            There are many places to list cars online, but AutoFinds is built
            with a few clear principles:
          </p>
          <ul className="features-list">
            <li>
              <strong>Focused only on enthusiast cars</strong>
              <br />
              No clutter, no common listings, this platform exists for people
              who genuinely care about cars.
            </li>
            <li>
              <strong>No middlemen</strong>
              <br />
              Buyers contact sellers directly. No brokers, no forced
              negotiations through a third party.
            </li>
            <li>
              <strong>Completely free</strong>
              <br />
              No listing fees.
              <br />
              No commissions.
              <br />
              No hidden charges.
            </li>
            <li>
              <strong>Wide range of cars</strong>
              <br />
              From Rolls-Royce and Lamborghini to Maruti 800 and Honda City.
            </li>
            <li>
              <strong>Simple, clean browsing experience</strong>
              <br />
              Powerful search, clear listings, and no unnecessary noise.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>How Listing Works</h2>
          <p>
            Listing a car on AutoFinds is simple and familiar, similar to any
            other online marketplace.
          </p>
          <p>The only difference is quality control.</p>
          <ul className="features-list">
            <li>You submit your vehicle with details and photos.</li>
            <li>
              The listing is reviewed by the admin to ensure it fits the
              enthusiast focus of the platform.
            </li>
            <li>
              Once approved, the car becomes visible to everyone on the website.
            </li>
          </ul>
          <p>Approval usually takes less than 24 hours.</p>
          <p>
            This step helps keep AutoFinds curated, relevant, and true to its
            purpose.
          </p>
        </section>

        <section className="about-section">
          <h2>Built by Enthusiasts, for Enthusiasts</h2>
          <p>
            AutoFinds isn't a corporate platform or a dealership-backed
            marketplace. It's built by car enthusiasts who saw a gap in the
            ecosystem and decided to fix it.
          </p>
          <p>
            The goal is simple: Make it easier for enthusiasts to find, list,
            and connect over cars they actually care about.
          </p>
          <p>If you love cars, you're already in the right place.</p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
