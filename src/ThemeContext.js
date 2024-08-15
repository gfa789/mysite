import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    '--bg-color': '#ffffff',
    '--text-color': '#333333',
    '--text-color-2': '#555555',
    '--primary-color': '#007bff',
    '--secondary-color': '#6c757d',
    '--navbar-bg': '#f8f9fa',
    '--sidebar-bg': '#ffffff',
    '--btn-hover-color' : '#eeeeee'
  },
  dark: {
    name: 'Dark',
    '--bg-color': '#333333',
    '--text-color': '#ffffff',
    '--text-color-2': '#dddddd',
    '--primary-color': '#0056b3',
    '--secondary-color': '#6c757d',
    '--navbar-bg': '#222222',
    '--sidebar-bg': '#444444',
    '--btn-hover-color': '#333333',
  },
  // Add more themes as needed
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? themes[savedTheme] : themes.light;
    });
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().theme) {
              setTheme(themes[userDoc.data().theme]);
            } else {
              // If user doesn't have a theme saved in Firestore, use local storage theme
              const localTheme = localStorage.getItem('theme');
              if (localTheme) {
                setTheme(themes[localTheme]);
                // Save local theme to Firestore
                await setDoc(doc(db, 'users', user.uid), { theme: localTheme }, { merge: true });
              }
            }
          } catch (err) {
            console.error("Error fetching user theme:", err);
            setError("Failed to load theme preference. Using saved or default theme.");
          }
        } else {
          // For non-authenticated users, use theme from local storage
          const localTheme = localStorage.getItem('theme');
          setTheme(localTheme ? themes[localTheme] : themes.light);
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    useEffect(() => {
      // Apply the theme to the root element
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
  
      // Save theme to local storage
      localStorage.setItem('theme', Object.keys(themes).find(key => themes[key] === theme));
    }, [theme]);
  
    const updateTheme = async (newTheme) => {
      setTheme(newTheme);
      const themeName = Object.keys(themes).find(key => themes[key] === newTheme);
      localStorage.setItem('theme', themeName);
      
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(doc(db, 'users', user.uid), { theme: themeName }, { merge: true });
        } catch (err) {
          console.error("Error updating user theme:", err);
          setError("Failed to save theme preference to account. It will be remembered on this device.");
        }
      }
    };
  
    return (
      <ThemeContext.Provider value={{ theme, updateTheme, error }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  
  export const useTheme = () => useContext(ThemeContext);