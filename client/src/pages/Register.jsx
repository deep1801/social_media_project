import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      type: "text",
      icon: User,
      placeholder: "Your full name",
      label: "Full name",
    },
    {
      name: "email",
      type: "email",
      icon: Mail,
      placeholder: "you@example.com",
      label: "Email address",
    },
    {
      name: "password",
      type: "password",
      icon: Lock,
      placeholder: "Min. 6 characters",
      label: "Password",
    },
    {
      name: "confirmPassword",
      type: "password",
      icon: Lock,
      placeholder: "Repeat your password",
      label: "Confirm password",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-brand-700 to-brand-600 relative overflow-hidden flex-col items-center justify-center p-12">
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
          <h1 className="text-4xl font-bold mb-3">Join SocialApp</h1>
          <p className="text-violet-100 text-lg max-w-xs">
            Start your journey and connect with amazing people today.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {[
              "Create your free profile",
              "Share posts & photos",
              "Connect with friends",
              "Real-time messaging",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-sm">{f}</span>
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
              Create account
            </h2>
            <p className="text-gray-500 mt-1.5">
              It's free and only takes a minute
            </p>
          </div>

          {error && (
            <div className="alert-error mb-6">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, type, icon: Icon, placeholder, label }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <Icon
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={17}
                  />
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder={placeholder}
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner w-4 h-4" /> Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight size={17} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 font-semibold hover:text-brand-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
