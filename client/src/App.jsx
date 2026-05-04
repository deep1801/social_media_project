import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import AISupportChat from "./pages/AiSupport";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Messages from "./pages/Messages";
import UserProfile from "./pages/UserProfile";

// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="spinner w-10 h-10" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

// 🌐 Public Route
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="spinner w-10 h-10" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    );
  }

  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AISupportChat />

        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Navbar />
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Navbar />
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/:userId"
            element={
              <ProtectedRoute>
                <Navbar />
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/:id"
            element={
              <ProtectedRoute>
                <Navbar />
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
