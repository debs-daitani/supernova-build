// Form validation utilities

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  return { valid: true }
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: true } // Optional field
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Please enter a valid URL (include http:// or https://)' }
  }
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' }
  }

  if (!/^[a-z0-9_-]+$/i.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' }
  }

  return { valid: true }
}

export function validateBio(bio: string): { valid: boolean; error?: string } {
  if (!bio) {
    return { valid: true } // Optional field
  }

  if (bio.length > 500) {
    return { valid: false, error: 'Bio must be less than 500 characters' }
  }

  return { valid: true }
}

export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Name is required' }
  }

  if (name.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' }
  }

  return { valid: true }
}

export function validateSocialHandle(handle: string, platform: string): { valid: boolean; error?: string } {
  if (!handle) {
    return { valid: true } // Optional field
  }

  // Remove @ if present
  const cleanHandle = handle.replace(/^@/, '')

  if (cleanHandle.length < 1) {
    return { valid: false, error: `Please enter a valid ${platform} handle` }
  }

  if (cleanHandle.length > 30) {
    return { valid: false, error: `${platform} handle must be less than 30 characters` }
  }

  if (!/^[a-z0-9_]+$/i.test(cleanHandle)) {
    return { valid: false, error: `${platform} handle can only contain letters, numbers, and underscores` }
  }

  return { valid: true }
}

export function sanitizeInput(input: string): string {
  return input.trim()
}
