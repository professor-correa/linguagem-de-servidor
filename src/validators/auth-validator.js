import { cleanText, isPlainObject } from './helpers.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(data) {
  if (!isPlainObject(data)) {
    return { error: 'Body must be a JSON object' };
  }

  const name = cleanText(data.name);
  const email = cleanText(data.email).toLowerCase();
  const phone = cleanText(data.phone).replace(/\D/g, '');
  const password = typeof data.password === 'string' ? data.password : '';

  if (name.length < 2 || name.length > 100) {
    return { error: 'Field name must have between 2 and 100 characters' };
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 150) {
    return { error: 'Field email must be a valid email address' };
  }

  if (phone.length < 10 || phone.length > 11) {
    return { error: 'Field phone must have 10 or 11 digits, area code included' };
  }

  // O bcrypt só considera os primeiros 72 bytes da senha.
  if (password.length < 8 || password.length > 72) {
    return { error: 'Field password must have between 8 and 72 characters' };
  }

  return { value: { name, email, phone, password } };
}

export function validateLogin(data) {
  if (!isPlainObject(data)) {
    return { error: 'Body must be a JSON object' };
  }

  const email = cleanText(data.email).toLowerCase();
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email || !password) {
    return { error: 'Fields email and password are required' };
  }

  return { value: { email, password } };
}
