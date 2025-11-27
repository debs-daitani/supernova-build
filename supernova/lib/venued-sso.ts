import jwt from 'jsonwebtoken'

const SSO_SECRET = process.env.VENUED_SSO_SECRET || process.env.JWT_SECRET || 'your-sso-secret-key'
const SSO_TOKEN_EXPIRY = '5m' // 5 minutes

export interface VenuedSSOPayload {
  userId: string
  email: string
  name?: string | null
  iat?: number
  exp?: number
}

/**
 * Generate a short-lived SSO token for VENUED authentication
 * @param userId - User ID to encode in token
 * @param email - User email
 * @param name - User name (optional)
 * @returns JWT token string
 */
export function generateVenuedSSOToken(
  userId: string,
  email: string,
  name?: string | null
): string {
  const payload: VenuedSSOPayload = {
    userId,
    email,
    name,
  }

  return jwt.sign(payload, SSO_SECRET, {
    expiresIn: SSO_TOKEN_EXPIRY,
    issuer: 'supernova-ai',
    audience: 'venued',
  })
}

/**
 * Verify and decode a VENUED SSO token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyVenuedSSOToken(token: string): VenuedSSOPayload | null {
  try {
    const decoded = jwt.verify(token, SSO_SECRET, {
      issuer: 'supernova-ai',
      audience: 'venued',
    }) as VenuedSSOPayload

    return decoded
  } catch (error) {
    console.error('SSO token verification failed:', error)
    return null
  }
}

/**
 * Extract SSO token from URL search params or headers
 * @param searchParams - URL search params
 * @param headers - Request headers (optional)
 * @returns Token string or null
 */
export function extractSSOToken(
  searchParams: URLSearchParams | string,
  headers?: Headers
): string | null {
  // Try URL params first
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams

  const tokenFromUrl = params.get('sso_token')
  if (tokenFromUrl) return tokenFromUrl

  // Try Authorization header
  if (headers) {
    const authHeader = headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7)
    }
  }

  return null
}

/**
 * Generate VENUED launch URL with SSO token
 * @param baseUrl - VENUED base URL (e.g., 'http://localhost:3000')
 * @param userId - User ID
 * @param email - User email
 * @param name - User name (optional)
 * @returns Full VENUED URL with SSO token
 */
export function generateVenuedLaunchUrl(
  baseUrl: string,
  userId: string,
  email: string,
  name?: string | null
): string {
  const token = generateVenuedSSOToken(userId, email, name)
  const url = new URL(baseUrl)
  url.searchParams.set('sso_token', token)
  return url.toString()
}
