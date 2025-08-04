import { Link } from "react-router-dom";

export default function VerifyPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-3xl font-bold mb-4">📧 Verify Your Email</h1>
      <p className="text-lg mb-6">
        We've sent a verification link to your email. Please check your inbox before logging in.
      </p>
      <Link to="/login" className="text-blue-600 underline">
        Return to Login
      </Link>
    </div>
  );
}
