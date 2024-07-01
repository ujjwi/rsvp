import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const login = ({token, userId}) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
