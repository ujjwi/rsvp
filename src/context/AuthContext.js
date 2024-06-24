import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const login = (token) => {
    try {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
