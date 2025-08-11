import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordCard() {
  const { updateProfile } = useAuth();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pwd.length < 6) return toast.error("Password must be at least 6 characters.");
    if (pwd !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await updateProfile({ password: pwd });
      setPwd(""); setConfirm("");
      toast.success("Password updated.");
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 space-y-3 mt-6">
      <h2 className="text-lg font-semibold text-purple-700">Change Password</h2>
      <input
        type="password"
        className="w-full border rounded px-3 py-2"
        placeholder="New password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        autoComplete="new-password"
        disabled={loading}
      />
      <input
        type="password"
        className="w-full border rounded px-3 py-2"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        disabled={loading}
      />
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Saving..." : "Update Password"}
      </button>
      <p className="text-xs text-gray-500">
        Tip: For higher security, we can require your current password before changing. Say the word and I’ll add it.
      </p>
    </form>
  );
}
