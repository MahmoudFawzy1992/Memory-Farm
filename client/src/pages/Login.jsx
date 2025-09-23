import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axiosInstance";
import FormInput from "../components/FormInput";
import AuthFormWrapper from "../components/AuthFormWrapper";
import WelcomeGuide from "../components/onboarding/WelcomeGuide";
import { getValidationErrors } from "../utils/formHelpers";

function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Redirect if already logged in (but not if we just logged in)
  if (user && !justLoggedIn) return <Navigate to="/" />;

  // Check onboarding status when user becomes available after login
  useEffect(() => {
    if (user && justLoggedIn) {
      checkOnboardingStatus();
    }
  }, [user, justLoggedIn]);

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
      setJustLoggedIn(true); // Flag that we just logged in
      toast.success("Welcome back!");
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

  const checkOnboardingStatus = async () => {
    try {
      // Add cache-busting headers to avoid 304 responses
      const response = await axios.get('/insights/onboarding/status', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.data.shouldShowWelcome && !response.data.onboardingStatus?.welcomeShown) {
        setShowWelcome(true);
      } else {
        // No onboarding needed, go to home
        setJustLoggedIn(false);
        navigate("/");
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // If onboarding check fails, just go to home
      setJustLoggedIn(false);
      navigate("/");
    }
  };

  const handleWelcomeComplete = async (completionType) => {
    setShowWelcome(false);
    setJustLoggedIn(false);
    
    if (completionType === 'navigation-complete') {
      // User completed navigation tutorial, go to new memory page
      setTimeout(() => {
        navigate('/new');
        toast.success('Great! Now let\'s create your first memory!');
      }, 300);
    } else {
      // Tutorial was completed or skipped
      navigate("/");
    }
  };

  const handleWelcomeSkip = async () => {
    setShowWelcome(false);
    setJustLoggedIn(false);
    navigate("/");
    toast.info('Welcome to Memory Farm! Check the FAQ button anytime for help.');
  };

  return (
    <>
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
        
        {/* Loading indicator during onboarding check */}
        {justLoggedIn && !showWelcome && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-700">Setting up your account...</p>
            </div>
          </div>
        )}
      </AuthFormWrapper>

      {/* Welcome Guide for New Users */}
      {showWelcome && (
        <WelcomeGuide
          onComplete={handleWelcomeComplete}
          onSkip={handleWelcomeSkip}
        />
      )}
    </>
  );
}

export default Login;