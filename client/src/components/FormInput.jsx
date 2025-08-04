// src/components/FormInput.jsx
import { useState } from "react";

function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  error = "",
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      {label && <label className="block mb-1 font-medium">{label}</label>}

      <div className="relative">
        <input
          type={isPassword && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full p-2 border rounded ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-2 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default FormInput;
