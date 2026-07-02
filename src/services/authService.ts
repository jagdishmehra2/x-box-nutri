import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { AuthUser } from '../types/auth'

export const mapAuthUser = (user: User): AuthUser => {
  const email = user.email ?? ''

  return {
    id: user.id,
    email,
    fullName:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      email.split('@')[0] ||
      'Customer',
    avatarUrl:
      user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    provider: user.app_metadata?.provider || 'email',
    createdAt: user.created_at,
  }
}

const fallbackAuthError = (message: string) => {
  return {
    error: {
      message,
    },
    data: null,
  }
}

const getSafeRedirectPath = (redirectPath: string) => {
  return redirectPath.startsWith('/') ? redirectPath : '/'
}

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    return fallbackAuthError('Please check your credentials.')
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    return fallbackAuthError('Try Again with different Credentials')
  }

  return supabase.auth.signUp({ email, password })
}

export const signInWithGoogle = async (redirectPath = '/') => {
  if (!supabase) {
    return fallbackAuthError('Google login is not configured.')
  }

  const callbackUrl = new URL('/auth/callback', window.location.origin)
  callbackUrl.searchParams.set('next', getSafeRedirectPath(redirectPath))

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })
}

export const signOutUser = async () => {
  if (!supabase) return

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
