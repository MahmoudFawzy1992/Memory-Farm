import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../components/FormInput";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { getValidationErrors } from "../utils/formHelpers";

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    const validation = getValidationErrors({ email, password });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("✅ Welcome back!");
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="Login" onSubmit={handleSubmit}>
      <FormInput
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        error={errors.email}
        autoComplete="email"
        disabled={loading}
      />
      <FormInput
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Your password"
        error={errors.password}
        autoComplete="current-password"
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white w-full py-2 rounded"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      <div className="text-right mt-2">
        <Link
          to="/forgot-password"
          className="text-sm text-blue-500 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </AuthFormWrapper>
  );
}

export default Login;
