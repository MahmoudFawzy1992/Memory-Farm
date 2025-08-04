import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
      const id = searchParams.get("id");

      if (!token || !id) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const res = await axios.post("/auth/verify-email", { token, id });
        const msg = res.data.message;

        if (msg === "Email already verified") {
          setStatus("success");
          setMessage("Your email was already verified. You can log in now.");
        } else {
          setStatus("success");
          setMessage("Email verified successfully!");
        }

        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err?.response?.data?.error || "Verification failed. Try again later."
        );
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {status === "loading" && <p>🔄 Verifying your email...</p>}

      {status === "success" && (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Verified!</h1>
          <p className="mb-2">{message}</p>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Verification Failed</h1>
          <p>{message}</p>
        </>
      )}
    </div>
  );
}
