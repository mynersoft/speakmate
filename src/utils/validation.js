/**
 * Input validation utilities for SpeakMate
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
}

export function validateDisplayName(name) {
  if (!name || typeof name !== 'string') return 'Display name is required';
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Display name must be at least 2 characters';
  }
  if (trimmed.length > 50) {
    return 'Display name cannot exceed 50 characters';
  }
  return null;
}

export function validateInviteCode(code) {
  if (!code || typeof code !== 'string') return 'Invite code is required';
  const trimmed = code.trim();
  if (trimmed.length < 3) {
    return 'Invite code is invalid';
  }
  return null;
}
