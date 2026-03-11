/**
 * Simple validation utilities for forms and API inputs.
 */

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.trim().length < min) return `${fieldName} must be at least ${min} characters`;
  return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value.trim().length > max) return `${fieldName} must be at most ${max} characters`;
  return null;
}

export function validateUrl(url: string): string | null {
  if (!url.trim()) return null; // URLs are usually optional
  try {
    new URL(url);
    return null;
  } catch {
    return "Invalid URL";
  }
}

export type ValidationErrors = Record<string, string>;

export function validateForm(rules: Array<[string, string | null]>): ValidationErrors {
  const errors: ValidationErrors = {};
  for (const [field, error] of rules) {
    if (error) errors[field] = error;
  }
  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
