import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { toast } from "react-toastify";
import AuthFormWrapper from "../components/AuthFormWrapper";
import FormInput from "../components/FormInput";

export default function ResetPassword() {
  const nav = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const token = params.get("token");
  const id = params.get("id");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!token || !id) return toast.error("Invalid reset link.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await axios.post(`/auth/reset-password/${token}`, { id, newPassword: password });
      toast.success("Password updated. Please log in.");
      nav("/login");
    } catch (err) {
      const msg = err?.response?.data?.error || "Reset failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormWrapper title="Reset Password" onSubmit={submit}>
      <FormInput
        label="New Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        autoComplete="new-password"
        disabled={loading}
      />
      <FormInput
        label="Confirm Password"
        type="password"
        name="confirm"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        autoComplete="new-password"
        disabled={loading}
      />
      <button type="submit" className="bg-purple-600 text-white w-full py-2 rounded" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </button>
    </AuthFormWrapper>
  );
}
