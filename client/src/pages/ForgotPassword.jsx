import { useState } from "react";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";
import AuthFormWrapper from "../components/AuthFormWrapper";
import FormInput from "../components/FormInput";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required.");
    setLoading(true);
    try {
      await axios.post("/auth/forgot-password", { email });
      toast.success("If that email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to request reset.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="Forgot Password" onSubmit={submit}>
      <FormInput
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={loading}
      />
      <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </AuthFormWrapper>
  );
}
