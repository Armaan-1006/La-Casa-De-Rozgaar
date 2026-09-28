import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useTheme } from './useTheme'
import { API_BASE, api } from '../services/api'

export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'EMPLOYER_ADMIN' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  headline?: string
  organization?: string
  avatarInitials?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  register: (data: RegisterData) => Promise<AuthResult>
  logout: () => void
  quickLogin: (preset: 'candidate' | 'candidate_data' | 'recruiter' | 'admin') => Promise<AuthResult>
}

const TOKEN_KEY = 'lcdr_auth_token'
const USER_KEY = 'lcdr_auth_user'

// Demo Preset Accounts matching backend database seed
export const DEMO_PRESETS: Record<string, { email: string; password: string; name: string; role: UserRole; headline: string; organization?: string }> = {
  candidate: {
    email: 'rahul@example.com',
    password: 'password123',
    name: 'Rahul Sharma',
    role: 'CANDIDATE',
    headline: 'Full Stack Engineer // React & Node.js',
    organization: 'Independent Talent',
  },
  candidate_data: {
    email: 'priya@example.com',
    password: 'password123',
    name: 'Priya Patel',
    role: 'CANDIDATE',
    headline: 'AI/ML Specialist & Data Scientist',
    organization: 'Neural Systems Lab',
  },
  recruiter: {
    email: 'recruiter@techcorp.in',
    password: 'password123',
    name: 'Vikram Malhotra',
    role: 'RECRUITER',
    headline: 'Talent Acquisition & Technical Recruiting Lead',
    organization: 'TechCorp India',
  },
  admin: {
    email: 'admin@rozgaar.in',
    password: 'password123',
    name: 'System Administrator',
    role: 'ADMIN',
    headline: 'Master Command & System Architect',
    organization: 'La Casa De Rozgaar',
  },
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { applyRoleDefaultTheme, resetThemeOnSignOut } = useTheme()

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  })

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem(USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const login = useCallback(async ({ email, password }: LoginCredentials): Promise<AuthResult> => {
    setIsLoading(true)
    const matchingPreset = Object.values(DEMO_PRESETS).find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    )

    try {
      const loginUrl = API_BASE.startsWith('http') ? `${API_BASE}/auth/login` : '/api/v1/auth/login'
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const contentType = res.headers.get('content-type') || ''
      let data: any = null
      if (contentType.includes('application/json')) {
        try {
          data = await res.json()
        } catch {}
      }

      if (res.ok && data?.data) {
        const returnedUser = data.data.user || data.data
        const authToken = data.data.token || data.data.accessToken

        const authUser: AuthUser = {
          id: returnedUser.id || data.data.userId || 'usr_' + Date.now(),
          email: email.trim(),
          role: (returnedUser.role?.toUpperCase() || matchingPreset?.role || 'CANDIDATE') as UserRole,
          name: returnedUser.name || matchingPreset?.name || email.split('@')[0],
          headline: matchingPreset?.headline || 'Intelligence Operative',
          organization: matchingPreset?.organization || 'La Casa De Rozgaar',
          avatarInitials: getInitials(returnedUser.name || matchingPreset?.name || email.split('@')[0]),
        }

        setToken(authToken || 'jwt_simulated_token_' + Date.now())
        setUser(authUser)
        api.setToken(authToken || null, authUser)
        try {
          localStorage.removeItem('lcdr_candidate_profile')
          window.dispatchEvent(new Event('candidate-profile-updated'))
        } catch {}
        applyRoleDefaultTheme(authUser.role)
        setIsLoading(false)

        return { success: true, user: authUser }
      }

      // If network response was not successful (e.g. 401, 404, HTML on Vercel deployment),
      // but user is authenticating with a valid demo preset or demo password
      if (matchingPreset && (password === 'password123' || password === matchingPreset.password)) {
        const authUser: AuthUser = {
          id: 'usr_' + matchingPreset.email.split('@')[0],
          email: matchingPreset.email,
          role: matchingPreset.role,
          name: matchingPreset.name,
          headline: matchingPreset.headline,
          organization: matchingPreset.organization,
          avatarInitials: getInitials(matchingPreset.name),
        }
        const simToken = 'lcdr_demo_jwt_' + Math.random().toString(36).substring(2)
        setToken(simToken)
        setUser(authUser)
        api.setToken(simToken, authUser)
        try {
          localStorage.removeItem('lcdr_candidate_profile')
          window.dispatchEvent(new Event('candidate-profile-updated'))
        } catch {}
        applyRoleDefaultTheme(authUser.role)
        setIsLoading(false)
        return { success: true, user: authUser }
      }

      setIsLoading(false)
      return {
        success: false,
        error: data?.error?.message || 'Authentication failed. Please verify credentials.',
      }
    } catch (err: any) {
      // Graceful offline fallback for demo/prototyping if network fails
      if (matchingPreset && (password === 'password123' || password === matchingPreset.password)) {
        const authUser: AuthUser = {
          id: 'usr_' + matchingPreset.email.split('@')[0],
          email: matchingPreset.email,
          role: matchingPreset.role,
          name: matchingPreset.name,
          headline: matchingPreset.headline,
          organization: matchingPreset.organization,
          avatarInitials: getInitials(matchingPreset.name),
        }
        const simToken = 'lcdr_demo_jwt_' + Math.random().toString(36).substring(2)
        setToken(simToken)
        setUser(authUser)
        api.setToken(simToken, authUser)
        try {
          localStorage.removeItem('lcdr_candidate_profile')
          window.dispatchEvent(new Event('candidate-profile-updated'))
        } catch {}
        applyRoleDefaultTheme(authUser.role)
        setIsLoading(false)
        return { success: true, user: authUser }
      }

      setIsLoading(false)
      return {
        success: false,
        error: err.message || 'Unable to connect to intelligence authentication gateway.',
      }
    }
  }, [applyRoleDefaultTheme])

  const register = useCallback(async ({ email, password, name, role }: RegisterData): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      const registerUrl = API_BASE.startsWith('http') ? `${API_BASE}/auth/register` : '/api/v1/auth/register'
      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setIsLoading(false)
        return {
          success: false,
          error: data.error?.message || 'Registration failed.',
        }
      }

      const returnedUser = data.data?.user || data.data
      const authToken = data.data?.token || data.data?.accessToken

      const authUser: AuthUser = {
        id: returnedUser.id || data.data?.userId || 'usr_' + Date.now(),
        email: email.trim(),
        role: role,
        name: name,
        headline: role === 'CANDIDATE' ? 'Newly Registered Candidate' : 'Workforce Specialist',
        organization: role === 'CANDIDATE' ? 'Independent Operative' : 'Enterprise Intelligence',
        avatarInitials: getInitials(name),
      }

      setToken(authToken || 'jwt_simulated_token_' + Date.now())
      setUser(authUser)
      api.setToken(authToken || null, authUser)
      try {
        localStorage.removeItem('lcdr_candidate_profile')
        window.dispatchEvent(new Event('candidate-profile-updated'))
      } catch {}
      // Automatically apply the registered user's role default theme (Candidate -> Heist, Recruiter -> Professional)
      applyRoleDefaultTheme(authUser.role)
      setIsLoading(false)

      return { success: true, user: authUser }
    } catch (err: any) {
      setIsLoading(false)
      return {
        success: false,
        error: err.message || 'Unable to reach registration server.',
      }
    }
  }, [applyRoleDefaultTheme])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    api.setToken(null, null)
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem('lcdr_candidate_profile')
      window.dispatchEvent(new Event('candidate-profile-updated'))
    } catch {}
    resetThemeOnSignOut()
  }, [resetThemeOnSignOut])

  const quickLogin = useCallback(
    async (presetKey: 'candidate' | 'candidate_data' | 'recruiter' | 'admin'): Promise<AuthResult> => {
      const preset = DEMO_PRESETS[presetKey]
      if (!preset) return { success: false, error: 'Invalid preset' }
      return login({ email: preset.email, password: preset.password })
    },
    [login]
  )

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    quickLogin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
