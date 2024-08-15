import React from 'react';
import './Home.css'


function Home() {
  return (
    <div className="home">
      <h1>Welcome to My Website</h1>
      <p>This is the home page of our amazing React application.</p>
      <section>
        <h2>Featured Content</h2>
        <ul>
          <li>Exciting Feature 1</li>
          <li>Awesome Feature 2</li>
          <li>Incredible Feature 3</li>
        </ul>
      </section>
      <section>
        <h2>Latest Updates</h2>
        <p>Stay tuned for our latest news and updates!</p>
      </section>
    </div>
  );
}

export default Home;