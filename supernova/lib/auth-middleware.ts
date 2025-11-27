import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-later'

export interface AuthResult {
  authenticated: boolean
  userId?: string
  email?: string
}

export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  try {
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return { authenticated: false }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
    }

    return {
      authenticated: true,
      userId: decoded.userId,
      email: decoded.email,
    }
  } catch (error) {
    return { authenticated: false }
  }
}
