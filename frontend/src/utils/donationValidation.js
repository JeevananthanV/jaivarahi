/**
 * Validation rules for Kosala donations and donor details
 */
export function validateDonationForm({
  donorName = '',
  donorPhone = '',
  donorEmail = '',
  donorCity = '',
  donorAddress = '',
  amount = 0,
  isPhysical = false,
  consentAgreed = true,
}) {
  const errors = {};

  // Name Validation
  if (!donorName.trim()) {
    errors.name = 'Please enter your full devotee name.';
  } else if (donorName.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters.';
  }

  // Phone Validation
  const cleanPhone = donorPhone.replace(/\D/g, '');
  const phone10 = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
  if (!phone10) {
    errors.phone = 'Mobile number is required for donation receipt.';
  } else if (phone10.length !== 10) {
    errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
  }

  // Email Validation (optional but must be valid if provided)
  if (donorEmail && donorEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  // City Validation
  if (!donorCity.trim()) {
    errors.city = 'Please specify your city or town.';
  }

  // Amount Validation (if financial donation)
  if (!isPhysical) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      errors.amount = 'Please choose a plan or enter a donation amount.';
    } else if (numAmount < 100) {
      errors.amount = 'Minimum contribution is ₹100.';
    }
  }

  // Consent Validation
  if (!consentAgreed) {
    errors.consent = 'You must agree to the terms to proceed.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
