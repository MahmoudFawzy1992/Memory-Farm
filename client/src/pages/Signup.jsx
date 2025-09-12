import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../components/FormInput";
import AuthFormWrapper from "../components/AuthFormWrapper";
import { getValidationErrors } from "../utils/formHelpers";
import { getPasswordStrengthUI, isPasswordAcceptable } from "../utils/passwordStrength";
import { sanitizeTextInput, sanitizeEmail } from "../utils/sanitization";

// Password strength indicator component
const PasswordStrengthIndicator = ({ password, email, displayName }) => {
  const strength = getPasswordStrengthUI(password, { email, displayName });

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      {strength.showRequirements && (
        <div className="text-xs space-y-1">
          <p className="font-medium text-gray-700">Password requirements:</p>
          <div className="grid grid-cols-2 gap-1">
            <RequirementItem 
              met={strength.requirements.length} 
              text="8+ characters" 
            />
            <RequirementItem 
              met={strength.requirements.uppercase} 
              text="Uppercase letter" 
            />
            <RequirementItem 
              met={strength.requirements.lowercase} 
              text="Lowercase letter" 
            />
            <RequirementItem 
              met={strength.requirements.numbers} 
              text="Number" 
            />
            <RequirementItem 
              met={strength.requirements.special} 
              text="Special character" 
            />
          </div>
        </div>
      )}

      {/* Errors and warnings */}
      {strength.errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          {strength.errors.map((error, index) => (
            <p key={index}>• {error}</p>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {strength.suggestions.length > 0 && strength.errors.length === 0 && (
        <div className="text-xs text-amber-600 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <p key={index}>💡 {suggestion}</p>
          ))}
        </div>
      )}

      {/* Success message */}
      {strength.valid && strength.score >= 3 && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Strong password! Estimated crack time: {strength.crackTime}
        </p>
      )}
    </div>
  );
};

// Individual requirement item component
const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-gray-400'}`}>
    <span className="text-xs">{met ? '✓' : '○'}</span>
    <span className="text-xs">{text}</span>
  </div>
);

function Signup() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" />;

  // Real-time password validation
  const passwordStrength = getPasswordStrengthUI(password, { email, displayName });
  const isPasswordValid = isPasswordAcceptable(password, { email, displayName });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    // Sanitize inputs
    const sanitizedDisplayName = sanitizeTextInput(displayName);
    const sanitizedEmail = sanitizeEmail(email);
    const trimmedPassword = password.trim();

    // Client-side validation
    const validation = getValidationErrors({ 
      name: sanitizedDisplayName, 
      email: sanitizedEmail, 
      password: trimmedPassword 
    });

    // Additional password confirmation check
    if (trimmedPassword !== confirmPassword) {
      validation.confirmPassword = "Passwords do not match";
    }

    // Enhanced password strength validation
    if (!isPasswordValid) {
      validation.password = passwordStrength.errors[0] || "Password does not meet requirements";
    }

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      await signup(sanitizedEmail, trimmedPassword, sanitizedDisplayName);
      toast.success("Account created! Please check your email to verify your account.");
      navigate("/verify-prompt");
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || "Signup failed. Please try again.";
      
      // Handle specific server errors
      if (message.includes("Email already in use")) {
        setErrors({ email: "This email is already registered" });
      } else if (message.includes("Password")) {
        setErrors({ password: message });
      } else if (message.includes("Display name")) {
        setErrors({ displayName: message });
      } else {
        setServerError(message);
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with sanitization
  const handleDisplayNameChange = (e) => {
    const value = e.target.value;
    // Allow typing but sanitize on blur
    setDisplayName(value);
    if (errors.displayName) {
      setErrors(prev => ({ ...prev, displayName: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  return (
    <AuthFormWrapper title="Create Your Account" onSubmit={handleSubmit}>
      <FormInput
        label="Display Name"
        name="displayName"
        value={displayName}
        onChange={handleDisplayNameChange}
        onBlur={(e) => setDisplayName(sanitizeTextInput(e.target.value))}
        placeholder="Your name"
        error={errors.displayName}
        autoComplete="name"
        disabled={loading}
        maxLength={50}
      />

      <FormInput
        label="Email Address"
        type="email"
        name="email"
        value={email}
        onChange={handleEmailChange}
        onBlur={(e) => setEmail(sanitizeEmail(e.target.value))}
        placeholder="you@example.com"
        error={errors.email}
        autoComplete="email"
        disabled={loading}
        maxLength={254}
      />

      <div className="space-y-1">
        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Create a strong password"
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
            maxLength={128}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-sm text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        
        <PasswordStrengthIndicator 
          password={password} 
          email={email} 
          displayName={displayName} 
        />
      </div>

      <FormInput
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        name="confirmPassword"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        autoComplete="new-password"
        disabled={loading}
        maxLength={128}
      />

      <button
        type="submit"
        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
          loading || !isPasswordValid || password !== confirmPassword
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-[1.02] shadow-lg'
        }`}
        disabled={loading || !isPasswordValid || password !== confirmPassword}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating Account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{serverError}</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
            Sign in here
          </a>
        </p>
      </div>

      {/* Security notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          🔒 Your password is encrypted and secure. We'll never share your information.
        </p>
      </div>
    </AuthFormWrapper>
  );
}

export default Signup;