import { supabase } from '../lib/supabase'

export const signInWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    return {
      error: {
        message:
          'Please check your credentials.',
      },
      data: null,
    }
  }

  return supabase.auth.signInWithPassword({ email, password })
}

export const signUpWithEmail = async (email: string, password: string) => {
  if (!supabase) {
    return {
      error: {
        message:
          'Try Again with different Credentials',
      },
      data: null,
    }
  }

  return supabase.auth.signUp({ email, password })
}

export const signOutUser = async () => {
  if (!supabase) return
  await supabase.auth.signOut()
}
