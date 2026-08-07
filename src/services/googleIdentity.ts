import { supabase } from '../lib/supabase'

export interface GoogleCredentialResponse {
  credential?: string
  select_by?: string
  clientId?: string
}

interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  context?: 'signin' | 'signup' | 'use'
  nonce?: string
  ux_mode?: 'popup' | 'redirect'
  auto_select?: boolean
  itp_support?: boolean
  use_fedcm_for_prompt?: boolean
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (configuration: GoogleIdConfiguration) => void
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfiguration,
          ) => void
          cancel: () => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

const googleIdentityScriptSrc = 'https://accounts.google.com/gsi/client'
const googleClientIdPattern = /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/
const googleClientIdConfigError =
  'Google login setup is incomplete. Deploy google-auth-config and add GOOGLE_CLIENT_ID in Supabase.'

let googleIdentityScriptPromise: Promise<void> | null = null
let googleClientIdPromise: Promise<string> | null = null

interface GoogleAuthConfigResponse {
  clientId?: unknown
}

const normalizeGoogleClientId = (clientId: unknown) => {
  if (typeof clientId !== 'string') {
    return ''
  }

  const trimmedClientId = clientId.trim()

  return googleClientIdPattern.test(trimmedClientId) ? trimmedClientId : ''
}

export const getGoogleClientId = () => {
  if (!supabase) {
    return Promise.reject(new Error('Google login Failed'))
  }

  if (googleClientIdPromise) {
    return googleClientIdPromise
  }

  googleClientIdPromise = supabase.functions
    .invoke<GoogleAuthConfigResponse>('google-auth-config', {
      method: 'GET',
    })
    .then(({ data, error }) => {
      if (error) {
        throw new Error(googleClientIdConfigError)
      }

      const clientId = normalizeGoogleClientId(data?.clientId)

      if (!clientId) {
        throw new Error(googleClientIdConfigError)
      }

      return clientId
    })
    .catch((error: unknown) => {
      googleClientIdPromise = null
      throw error
    })

  return googleClientIdPromise
}

export const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${googleIdentityScriptSrc}"]`,
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Google Identity Services failed to load.')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = googleIdentityScriptSrc
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Google Identity Services failed to load.'))

    document.head.appendChild(script)
  })

  return googleIdentityScriptPromise
}

export const createGoogleNonce = async () => {
  if (!window.crypto?.getRandomValues || !window.crypto?.subtle) {
    throw new Error('Secure browser crypto is required for Google sign-in.')
  }

  const nonce = btoa(
    String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(32))),
  )
  const encodedNonce = new TextEncoder().encode(nonce)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encodedNonce)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return { hashedNonce, nonce }
}
