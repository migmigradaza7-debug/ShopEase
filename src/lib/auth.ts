export interface UserAccount {
  fullName: string;
  email: string;
  password: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignupInput(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!fullName) {
    return { valid: false, error: "Please enter your full name." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters long.",
    };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match." };
  }

  return { valid: true };
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}): ValidationResult {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { valid: false, error: "Please enter your password." };
  }

  return { valid: true };
}

export function verifyCredentials(
  users: UserAccount[],
  email: string,
  password: string,
): UserAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  const match = users.find(
    (user) =>
      user.email.trim().toLowerCase() === normalizedEmail &&
      user.password === password,
  );
  return match ?? null;
}

export function validateContactInput(input: {
  name: string;
  email: string;
  message: string;
}): ValidationResult {
  if (!input.name.trim()) {
    return { valid: false, error: "Please enter your full name." };
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  if (input.message.trim().length < 10) {
    return {
      valid: false,
      error: "Please include at least 10 characters in your message.",
    };
  }
  return { valid: true };
}

export const AUTH_COOKIE_NAME = "shopease_auth";

export function isPublicAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/")
  );
}

export function resolveAuthRedirect(input: {
  pathname: string;
  isAuthenticated: boolean;
}): string | null {
  if (!input.isAuthenticated && !isPublicAuthPath(input.pathname)) {
    return "/login";
  }
  return null;
}

