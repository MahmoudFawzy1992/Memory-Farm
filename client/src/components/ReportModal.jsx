import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function ReportModal({ isOpen, onClose, targetType, targetId }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please enter a reason");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/report", {
        targetType,
        targetId,
        reason,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to submit report. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Report {targetType === "user" ? "User" : "Memory"}
        </h2>

        <textarea
          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:text-white"
          rows="4"
          placeholder="What's wrong?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading || success}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm mt-2">Report submitted ✅</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Reporting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
