import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './components/Home/Home';
import About from './components/About/About';
import SignIn from './components/SignIn/SignIn';
import Navbar from './components/Navbar/Navbar';

import { ThemeProvider } from './ThemeContext';

function App() {

  return (
    <ThemeProvider>   
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
    </Router>
    </ThemeProvider>
 
  );
}

export default App;