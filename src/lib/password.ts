// Password validation utilities

export interface PasswordStrength {
  score: number // 0-4
  label: string // 'Weak', 'Fair', 'Good', 'Strong'
  color: string // CSS color
  feedback: string[]
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters')
  } else {
    score++
  }

  if (password.length >= 12) {
    score++
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Include at least one uppercase letter')
  } else {
    score++
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Include at least one lowercase letter')
  } else {
    score++
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push('Include at least one number')
  } else {
    score++
  }

  // Special character check
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Include at least one special character (!@#$%^&*)')
  } else {
    score++
  }

  // Common password check
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'letmein']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    feedback.push('Avoid common passwords')
    score = Math.max(0, score - 2)
  }

  // Calculate label and color
  let label: string
  let color: string

  if (score <= 2) {
    label = 'Weak'
    color = '#ef4444'
  } else if (score === 3) {
    label = 'Fair'
    color = '#f97316'
  } else if (score === 4) {
    label = 'Good'
    color = '#eab308'
  } else {
    label = 'Strong'
    color = '#22c55e'
  }

  return {
    score: Math.min(score, 4),
    label,
    color,
    feedback,
  }
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Hash password using Web Crypto API (for demo - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or similar
  // This is just a placeholder
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Verify password (placeholder - use bcrypt.compare in production)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}
