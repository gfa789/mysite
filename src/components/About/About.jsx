import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = "Football Scores & League Tables";
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const videoSectionRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(typing);
        setIsTypingComplete(true);
      }
    }, 100);

    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const videoSection = videoSectionRef.current;
    if (!video || !videoSection) return;

    const handleScroll = () => {
      if (!videoLoaded) return;

      const rect = videoSection.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      
      if (scrollProgress >= 0 && scrollProgress <= 1) {
        const targetTime = video.duration * scrollProgress;
        video.currentTime = targetTime;
      }
    };

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    window.addEventListener('scroll', handleScroll);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [videoLoaded]);

  return (
    <div className="about-page">
      <section className="hero">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {typedText}
          {!isTypingComplete && <span className="cursor">|</span>}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          Stay updated with the latest Premier League action
        </motion.p>
      </section>

      <section className="video-section" ref={videoSectionRef}>
        <div className="video-container">
          <video
            ref={videoRef}
            muted
            playsInline
            src="/encoded.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      <section className="content-section">
        <div className="content-row">
          <div className="text-column">
            <h2>Home</h2>
            <p>Get real-time scores and league standings at a glance. Stay connected to the pulse of the game with our intuitive and responsive interface.</p>
            <button onClick={() => navigate('/')}>Go to Home</button>
          </div>
          <div className="image-column">
            <img src="/api/placeholder/400/300" alt="Home page preview" />
          </div>
        </div>

        <div className="content-row">
          <div className="image-column">
            <img src="/api/placeholder/400/300" alt="Sign up page preview" />
          </div>
          <div className="text-column">
            <h2>Create an Account</h2>
            <p>Sign up to personalize your experience and set favorite teams. Get tailored notifications and in-depth analysis of your preferred clubs and players.</p>
            <button onClick={() => navigate('/signup')}>Create Account</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;