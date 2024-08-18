import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import './About.css';

const About = () => {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const fullText = "Atki's Football Hub";
  const contentRowRefs = useRef([]);
  const videoSectionRef = useRef(null);
  const navigate = useNavigate();
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const { scrollY } = useScroll();

  const images = useMemo(() => {
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= 340; i++) {
      const img = new Image();
      img.src = `/assets/aboutvid/${i}.webp`;
      img.onload = () => {
        
      };
      loadedCount++;
        if (loadedCount === 340) {
          setImagesLoaded(true);
        }
      loadedImages.push(img);
    }
    return loadedImages;
  }, []);

  const render = useCallback((index) => {
    if (videoRef.current && images[index-1] && images[index-1].complete) {
      const ctx = videoRef.current.getContext('2d');
      const canvas = videoRef.current;
      const container = containerRef.current;
      
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const scale = Math.max(canvas.width / images[index-1].width, canvas.height / images[index-1].height);
        const x = (canvas.width / 2) - (images[index-1].width / 2) * scale;
        const y = (canvas.height / 2) - (images[index-1].height / 2) * scale;

        ctx.drawImage(images[index-1], x, y, images[index-1].width * scale, images[index-1].height * scale);
      }
    }
  }, [images]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (heroRef.current && imagesLoaded) {
      const heroHeight = heroRef.current.offsetHeight;
      const scrollProgress = Math.max(0, Math.min(1, (latest - heroHeight + 500) / (heroHeight)));
      const frameIndex = Math.floor(scrollProgress * 339) + 1; // 339 because we have 340 frames (1-340)
      render(frameIndex);
    }
  });

  useEffect(() => {
    if (imagesLoaded) {
      render(1); // Render first frame when images are loaded
    }
  }, [imagesLoaded, render]);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(typing);
        setIsTypingComplete(true);
      }
    }, 40);

    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    contentRowRefs.current.forEach((row) => {
      if (row) observer.observe(row);
    });

    return () => {
      contentRowRefs.current.forEach((row) => {
        if (row) observer.unobserve(row);
      });
    };
  }, []);

  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="about-page">
      <section className="video-section" ref={containerRef}>
      {!imagesLoaded && (
  <div className="loading-indicator">
    Loading video...
  </div>
)}
        <div className="video-container">
          <canvas ref={videoRef} className="video-canvas" />
        </div>
      </section>

      <section className="hero" ref={heroRef}>
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
          transition={{ delay: 1, duration: 0.5 }}
        >
          Stay updated with the latest standings and get AI-powered betting tips
        </motion.p>
        <motion.button
          className="discover-more-btn"
          onClick={scrollToVideo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          Discover More
        </motion.button>
      </section>


      <section className="content-section" ref={videoSectionRef}>
        <div className="content-container">
          <div className="content-row" ref={(el) => (contentRowRefs.current[0] = el)}>
            <div className="text-column">
              <h2>Home</h2>
              <p>Get real-time scores and league standings at a glance. Stay connected to the pulse of the game with our intuitive and responsive interface.</p>
              <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
            <div className="image-column">
              <img src="/assets/about/dash.png" alt="Home page preview" />
            </div>
          </div>

          <div className="content-row" ref={(el) => (contentRowRefs.current[1] = el)}>
            <div className="image-column">
              <img src="/assets/about/dash.png" alt="Sign up page preview" />
            </div>
            <div className="text-column">
              <h2>Create an Account</h2>
              <p>Sign up to personalize your experience and set favorite teams. Get tailored notifications and in-depth analysis of your preferred clubs and players.</p>
              <button onClick={() => navigate('/register')}>Create Account</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;