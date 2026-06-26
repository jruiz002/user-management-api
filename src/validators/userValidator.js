const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCreateUser(body) {
  const errors = [];

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
    errors.push('email is required and must be a valid email address');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateCreateUser };
