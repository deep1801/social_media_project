import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axiosInstance.get("/api/v1/auth/me");
        setUser(res.data.data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });
      const { token, data } = res.data;
      if (!token || !data) {
        throw new Error("Invalid response from server");
      }
      localStorage.setItem("token", token);
      setUser(data);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        throw error;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        throw new Error(
          "No response from server. Please check your connection.",
        );
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message);
        throw new Error("Error setting up login request");
      }
    }
  };

  const register = async (name, email, password) => {
    const res = await axiosInstance.post("/api/v1/auth/register", {
      name,
      email,
      password,
    });
    const { token, data } = res.data;
    localStorage.setItem("token", token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await axiosInstance.get("/api/v1/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
