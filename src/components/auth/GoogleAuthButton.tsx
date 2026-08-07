import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../common/Button'
import { cn } from '../../utils/cn'
import {
  createGoogleNonce,
  getGoogleClientId,
  loadGoogleIdentityScript,
  type GoogleCredentialResponse,
} from '../../services/googleIdentity'

interface GoogleCredentialPayload {
  credential: string
  nonce?: string
}

interface GoogleAuthButtonProps {
  className?: string
  disabled?: boolean
  isLoading?: boolean
  loadingLabel?: string
  onCredential: (payload: GoogleCredentialPayload) => void | Promise<void>
  onError?: (message: string) => void
}

const defaultButtonWidth = 288
const minButtonWidth = 200
const maxButtonWidth = 400

const getBoundedButtonWidth = (width: number) => {
  if (!Number.isFinite(width) || width <= 0) {
    return defaultButtonWidth
  }

  return Math.min(maxButtonWidth, Math.max(minButtonWidth, Math.floor(width)))
}

const clearGoogleButtonContainer = (container: HTMLElement) => {
  container.replaceChildren()
}

const getGoogleSetupErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.startsWith('Google login')) {
    return error.message
  }

  return 'Google sign-in is unavailable right now.'
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35.5 24 35.5c-6.4 0-11.7-4.4-13.2-10.3-.3-1-.5-2.1-.5-3.2s.2-2.2.5-3.2C12.3 12.9 17.6 8.5 24 8.5c3.4 0 6.4 1.2 8.8 3.3l5.7-5.7C34.9 2.6 29.7.5 24 .5 11.5.5 1.5 10.5 1.5 23S11.5 45.5 24 45.5c12 0 22-8.7 22-22 0-1.5-.2-2.7-.4-3z"
    />
    <path
      fill="#FF3D00"
      d="M3.2 13.5l6.6 4.8C11.7 14.1 17.4 10.5 24 10.5c3.4 0 6.4 1.2 8.8 3.3l5.7-5.7C34.9 4.6 29.7 2.5 24 2.5c-9.1 0-16.9 5.2-20.8 11z"
    />
    <path
      fill="#4CAF50"
      d="M24 45.5c5.6 0 10.7-1.9 14.6-5.2l-6.7-5.5c-2.2 1.5-5 2.4-7.9 2.4-5.3 0-9.7-2.9-11.7-7.1l-6.6 5.1C9 40.3 16 45.5 24 45.5z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-1 2.6-2.8 4.8-5.1 6.3l6.7 5.5c3.9-3.6 6.6-9 6.6-15.8 0-1.5-.2-2.7-.4-3z"
    />
  </svg>
)

export const GoogleAuthButton = ({
  className,
  disabled = false,
  isLoading = false,
  loadingLabel = 'Connecting...',
  onCredential,
  onError,
}: GoogleAuthButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const credentialHandlerRef = useRef(onCredential)
  const errorHandlerRef = useRef(onError)
  const isMountedRef = useRef(false)
  const nonceRef = useRef<string | undefined>(undefined)
  const [buttonWidth, setButtonWidth] = useState(defaultButtonWidth)
  const [isReady, setIsReady] = useState(false)
  const [setupError, setSetupError] = useState('')

  useEffect(() => {
    credentialHandlerRef.current = onCredential
    errorHandlerRef.current = onError
  }, [onCredential, onError])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const updateButtonWidth = () => {
      const nextWidth = getBoundedButtonWidth(container.getBoundingClientRect().width)
      setButtonWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth,
      )
    }

    updateButtonWidth()

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateButtonWidth)
        : null

    observer?.observe(container)
    window.addEventListener('resize', updateButtonWidth)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateButtonWidth)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    const showSetupError = (message: string) => {
      if (isCancelled) {
        return
      }

      setSetupError(message)
      setIsReady(false)
      errorHandlerRef.current?.(message)
    }

    const renderGoogleButton = async () => {
      setSetupError('')
      setIsReady(false)

      try {
        const [{ hashedNonce, nonce }, googleClientId] = await Promise.all([
          createGoogleNonce(),
          getGoogleClientId(),
          loadGoogleIdentityScript(),
        ])

        const buttonContainer = buttonRef.current

        if (isCancelled || !buttonContainer) {
          return
        }

        const googleIdentity = window.google?.accounts?.id

        if (!googleIdentity) {
          showSetupError('Google sign-in is unavailable right now.')
          return
        }

        nonceRef.current = nonce
        googleIdentity.initialize({
          client_id: googleClientId,
          callback: (response: GoogleCredentialResponse) => {
            if (!isMountedRef.current) {
              return
            }

            const credential = response.credential

            if (!credential) {
              errorHandlerRef.current?.(
                'Google sign-in did not return valid credential.',
              )
              return
            }

            void credentialHandlerRef.current({
              credential,
              nonce: nonceRef.current,
            })
          },
          context: 'signin',
          ux_mode: 'popup',
          nonce: hashedNonce,
          itp_support: true,
          use_fedcm_for_prompt: true,
        })

        clearGoogleButtonContainer(buttonContainer)
        googleIdentity.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: `${buttonWidth}`,
        })
        setIsReady(true)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Google sign-in setup failed:', error)
        }

        showSetupError(getGoogleSetupErrorMessage(error))
      }
    }

    void renderGoogleButton()

    return () => {
      isCancelled = true
    }
  }, [buttonWidth])

  const shouldShowFallback = !isReady || isLoading || disabled || Boolean(setupError)
  const fallbackLabel = isLoading ? loadingLabel : 'Continue with Google'

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-11 w-full min-w-[200px] max-w-72 items-center justify-center rounded-lg',
        className,
      )}
    >
      <div
        ref={buttonRef}
        className={cn(
          'flex h-10 w-full items-center justify-center transition-opacity',
          shouldShowFallback ? 'opacity-0' : 'opacity-100',
        )}
      />

      {shouldShowFallback ? (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="absolute inset-0 h-full w-full gap-3 border border-[#9d3f67] bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 focus-visible:outline-[#9d3f67]"
          disabled
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          {fallbackLabel}
        </Button>
      ) : null}
    </div>
  )
}
