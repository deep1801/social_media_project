import { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import socket from "../api/socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Connect socket when user logs in, disconnect on logout
  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("user:join", user._id);
    } else {
      socket.disconnect();
    }
  }, [user?._id]);

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
      if (!token || !data) throw new Error("Invalid response from server");
      localStorage.setItem("token", token);
      setUser(data);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        throw error;
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check your connection.",
        );
      } else {
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

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
