import React from 'react';
import "./About.css"

function About() {
  return (
    <div className="about">
      <h1>About Us</h1>
      <p>We are a passionate team dedicated to creating amazing web experiences.</p>
      <section>
        <h2>Our Mission</h2>
        <p>To provide innovative solutions and exceed customer expectations in every project we undertake.</p>
      </section>
      <section>
        <h2>Our Team</h2>
        <ul>
          <li>John Doe - Founder & CEO</li>
          <li>Jane Smith - Lead Developer</li>
          <li>Mike Johnson - UX Designer</li>
        </ul>
      </section>
      <section>
        <h2>Contact Us</h2>
        <p>Email: info@example.com</p>
        <p>Phone: (123) 456-7890</p>
      </section>
    </div>
  );
}

export default About;