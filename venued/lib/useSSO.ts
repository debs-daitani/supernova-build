/**
 * VENUED SSO Hook
 *
 * Handles Single Sign-On authentication from SUPERNova
 * Extracts SSO token from URL and verifies it with the API
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifySSOToken } from './api-client'

export interface SSOUser {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface SSOState {
  isLoading: boolean
  isAuthenticated: boolean
  user: SSOUser | null
  error: string | null
}

/**
 * Custom hook to handle SSO authentication from SUPERNova
 * Automatically checks for sso_token in URL params and verifies it
 */
export function useSSO() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<SSOState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  })

  useEffect(() => {
    const handleSSO = async () => {
      // Check for SSO token in URL
      const ssoToken = searchParams?.get('sso_token')

      if (!ssoToken) {
        // No SSO token, check localStorage for existing session
        const storedUser = localStorage.getItem('venued_user')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            setState({
              isLoading: false,
              isAuthenticated: true,
              user,
              error: null,
            })
          } catch (e) {
            localStorage.removeItem('venued_user')
            setState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: null,
            })
          }
        } else {
          setState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            error: null,
          })
        }
        return
      }

      // Verify SSO token with API
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const response = await verifySSOToken(ssoToken)

        if (response.user) {
          // Store user session
          localStorage.setItem('venued_user', JSON.stringify(response.user))

          setState({
            isLoading: false,
            isAuthenticated: true,
            user: response.user,
            error: null,
          })

          // Remove token from URL for security
          const url = new URL(window.location.href)
          url.searchParams.delete('sso_token')
          window.history.replaceState({}, '', url.toString())
        } else {
          throw new Error('No user data returned')
        }
      } catch (error: any) {
        console.error('SSO verification failed:', error)
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: error.message || 'Authentication failed',
        })

        // Clear any stored session
        localStorage.removeItem('venued_user')
      }
    }

    handleSSO()
  }, [searchParams, router])

  const logout = () => {
    localStorage.removeItem('venued_user')
    setState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      error: null,
    })
  }

  return {
    ...state,
    logout,
  }
}
