/**
 * Shared form validation utilities for the Varahi React project.
 * Provides reusable validator functions and a helper to run them.
 */

// ─── Individual field validators ───────────────────────────────────────────

/**
 * Check that a value is not empty after trimming.
 * @param {string} value
 * @returns {boolean}
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

/**
 * Validate an email address using a standard RFC 5322 simplified pattern.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(email).trim());
};

/**
 * Validate a phone number (accepts 10 digits, optionally with +91 prefix).
 * Strips non-digit characters before checking.
 * @param {string} phone
 * @param {number} [minDigits=10] - Minimum number of digits required.
 * @returns {boolean}
 */
export const isValidPhone = (phone, minDigits = 10) => {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= minDigits && digits.length <= 15;
};

/**
 * Validate that a value meets a minimum length requirement.
 * @param {string} value
 * @param {number} min
 * @returns {boolean}
 */
export const hasMinLength = (value, min) => {
  if (value === null || value === undefined) return false;
  return String(value).trim().length >= min;
};

/**
 * Validate that a numeric value is positive (> 0).
 * @param {string|number} value
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate that a numeric value is a positive integer.
 * @param {string|number} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

/**
 * Validate a 6-digit Indian PIN code.
 * @param {string} pincode
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  if (!pincode) return false;
  return /^[1-9][0-9]{5}$/.test(String(pincode).trim());
};

/**
 * Validate that two values match (e.g. password confirmation).
 * @param {string} value
 * @param {string} confirmValue
 * @returns {boolean}
 */
export const doValuesMatch = (value, confirmValue) => {
  return String(value) === String(confirmValue);
};

/**
 * Validate a password meets minimum strength requirements.
 * Requires at least 6 characters.
 * @param {string} password
 * @param {number} [minLength=6]
 * @returns {boolean}
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password) return false;
  return String(password).length >= minLength;
};

// ─── Validation runner ─────────────────────────────────────────────────────

/**
 * Run a set of validation rules against a data object and return an errors object.
 *
 * @example
 * const errors = validateFields({ email: 'foo', phone: '123' }, {
 *   email: [{ rule: 'required', message: 'Email is required' },
 *           { rule: 'email', message: 'Enter a valid email' }],
 *   phone: [{ rule: 'required', message: 'Phone is required' },
 *           { rule: 'phone', message: 'Enter a valid 10-digit phone' }],
 * });
 * // errors = { email: 'Enter a valid email', phone: 'Enter a valid 10-digit phone' }
 *
 * @param {object} data - The form data object.
 * @param {object} rules - Field-name → array of rule descriptors.
 * @returns {object} - Object of field-name → error-message (empty if all valid).
 */
export const validateFields = (data, rules) => {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const ruleObj of fieldRules) {
      const { rule, message, param } = ruleObj;
      let valid = true;

      switch (rule) {
        case 'required':
          valid = isRequired(value);
          break;
        case 'email':
          valid = isValidEmail(value);
          break;
        case 'phone':
          valid = isValidPhone(value, param || 10);
          break;
        case 'minLength':
          valid = hasMinLength(value, param || 1);
          break;
        case 'positiveNumber':
          valid = isPositiveNumber(value);
          break;
        case 'positiveInteger':
          valid = isPositiveInteger(value);
          break;
        case 'pincode':
          valid = isValidPincode(value);
          break;
        case 'password':
          valid = isValidPassword(value, param || 6);
          break;
        case 'match':
          valid = doValuesMatch(value, data[param]);
          break;
        case 'custom':
          valid = param(value, data);
          break;
        default:
          break;
      }

      if (!valid) {
        errors[field] = message;
        break; // Stop at first failing rule for this field
      }
    }
  }

  return errors;
};

/**
 * Check if a validation errors object has any errors.
 * @param {object} errors
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};