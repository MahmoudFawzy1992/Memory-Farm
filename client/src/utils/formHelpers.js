// src/utils/formHelpers.js

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.toLowerCase());
}

export function validatePassword(password) {
  if (typeof password !== "string" || password.trim().length < 6) return false;
  const weakPasswords = ["123456", "password", "qwerty"];
  return !weakPasswords.includes(password.trim());
}

export function validateName(name) {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 30;
}

export function getValidationErrors({ name, email, password }) {
  const errors = {};

  if (name !== undefined) {
    if (!name.trim()) {
      errors.name = "Name is required.";
    } else if (!validateName(name)) {
      errors.name = "Name must be between 2 and 30 characters.";
    }
  }

  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  } else if (!validatePassword(password)) {
    errors.password = "Password is too common.";
  }

  return errors;
}
