import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../components/FormInput";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { getValidationErrors } from "../utils/formHelpers";

function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = getValidationErrors({ displayName, email, password });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, displayName);
      toast.success("Signup successful! Please verify your email.");
      navigate("/verify-prompt");
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Signup failed. Please try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="Signup" onSubmit={handleSubmit}>
      <FormInput
        label="Name"
        name="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        error={errors.name}
        autoComplete="name"
        disabled={loading}
      />
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
        placeholder="Choose a password"
        error={errors.password}
        autoComplete="new-password"
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-green-600 text-white w-full py-2 rounded"
        disabled={loading}
      >
        {loading ? "Signing up..." : "Signup"}
      </button>
      {serverError && (
  <p className="text-red-600 text-sm mt-3 text-center">{serverError}</p>
)}

    </AuthFormWrapper>
  );
}

export default Signup;
