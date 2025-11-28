// Security utility functions

/**
 * Mask email address for display
 * Example: user@example.com -> us***@ex***.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email
  }

  const [localPart, domain] = email.split('@')
  const [domainName, ...domainParts] = domain.split('.')

  // Mask local part (keep first 2 chars)
  const maskedLocal = localPart.length > 2
    ? `${localPart.substring(0, 2)}${'*'.repeat(Math.min(localPart.length - 2, 3))}`
    : localPart

  // Mask domain name (keep first 2 chars)
  const maskedDomain = domainName.length > 2
    ? `${domainName.substring(0, 2)}${'*'.repeat(Math.min(domainName.length - 2, 3))}`
    : domainName

  return `${maskedLocal}@${maskedDomain}.${domainParts.join('.')}`
}

/**
 * Mask phone number for display
 * Example: +905551234567 -> +90***1234567
 */
export function maskPhone(phone: string): string {
  if (!phone) return phone

  // Keep country code and last 4 digits
  if (phone.length > 7) {
    const visibleStart = phone.substring(0, 3) // Country code
    const visibleEnd = phone.substring(phone.length - 4)
    const masked = '*'.repeat(Math.max(phone.length - 7, 3))
    return `${visibleStart}${masked}${visibleEnd}`
  }

  return phone
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

