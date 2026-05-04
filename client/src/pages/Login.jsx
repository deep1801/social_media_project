import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401)
        setError("Invalid email or password. Please try again.");
      else if (err.response?.status === 500)
        setError("Server error. Please try again later.");
      else if (err.response?.data?.error) setError(err.response.data.error);
      else if (err.request)
        setError("Cannot connect to the server. Please check your connection.");
      else setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-white rounded-lg" />
          </div>
          <h1 className="text-4xl font-bold mb-3">SocialApp</h1>
          <p className="text-brand-100 text-lg max-w-xs">
            Connect, share, and discover with people around you.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              ["10K+", "Users"],
              ["50K+", "Posts"],
              ["100K+", "Connections"],
            ].map(([n, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold">{n}</div>
                <div className="text-brand-200 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 mt-1.5">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="alert-error mb-6">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={17}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-4 h-4" /> Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={17} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-600 font-semibold hover:text-brand-700"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
