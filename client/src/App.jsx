import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import NewMemory from "./pages/NewMemory";
import ViewMemory from "./pages/ViewMemory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyPrompt from "./pages/VerifyPrompt";
import VerifyEmail from "./pages/VerifyEmail";
import Settings from "./pages/Settings";
import Discover from "./pages/Discover";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./components/routes/PrivateRoute";
import HelpButton from "./components/onboarding/HelpButton";
import { useAuth } from "./context/AuthContext";

function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Check if we should show help button
  const shouldShowHelpButton = user && !isAuthPage(location.pathname);

  return (
    <div>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="verify-prompt" element={<VerifyPrompt />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />

          {/* Smart Home Route - Landing for guests, Home for users */}
          <Route
            index
            element={
              user ? (
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Private Routes */}
          <Route
            path="new"
            element={
              <PrivateRoute>
                <NewMemory />
              </PrivateRoute>
            }
          />
          <Route
            path="memory/:id"
            element={
              <PrivateRoute>
                <ViewMemory />
              </PrivateRoute>
            }
          />
          <Route
            path="settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="discover"
            element={
              <PrivateRoute>
                <Discover />
              </PrivateRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="mood-tracker"
            element={
              <PrivateRoute>
                <MoodTracker />
              </PrivateRoute>
            }
          />
          <Route
            path="user/:id"
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Global Help Button - only show for authenticated users on non-auth pages */}
      {shouldShowHelpButton && <HelpButton />}
    </div>
  );
}

// Helper function to check if current page is auth-related
function isAuthPage(pathname) {
  const authPages = [
    '/login',
    '/signup', 
    '/verify-prompt',
    '/verify-email',
    '/forgot-password',
    '/reset-password'
  ];
  return authPages.includes(pathname);
}

export default App;