import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleAuthButton } from './GoogleAuthButton'
import {
  signInWithGoogle,
  type GoogleSignInCredential,
} from '../../services/authService'

interface AuthPromptModalProps {
  open: boolean
  onClose: () => void
  redirectPath?: string
}

const getSafeRedirectPath = (redirectPath?: string) => {
  return redirectPath?.startsWith('/') ? redirectPath : '/'
}

export const AuthPromptModal = ({
  open,
  onClose,
  redirectPath = '/',
}: AuthPromptModalProps) => {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  const handleGoogleCredential = useCallback(
    async ({ credential, nonce }: GoogleSignInCredential) => {
      const safeRedirectPath = getSafeRedirectPath(redirectPath)

      setSubmitError('')
      setIsGoogleSubmitting(true)

      const { error } = await signInWithGoogle({ credential, nonce })

      if (error) {
        setSubmitError(error.message)
        setIsGoogleSubmitting(false)
        return
      }

      navigate(safeRedirectPath, { replace: true })
    },
    [navigate, redirectPath],
  )

  const handleGoogleError = useCallback((message: string) => {
    setSubmitError(message)
    setIsGoogleSubmitting(false)
  }, [])

  if (!open) {
    return null
  }

  return (
    <div
      className="auth-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-3 py-5 backdrop-blur-[2px] sm:px-4 sm:py-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal-panel w-full max-w-md rounded-2xl bg-white px-5 py-6 text-zinc-950 shadow-2xl shadow-black/30 sm:px-8 sm:py-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="auth-modal-title"
            className="text-3xl font-semibold leading-none text-zinc-950 sm:text-4xl"
          >
            Sign in
          </h2>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d3f67] sm:h-10 sm:w-10"
            aria-label="Close sign in popup"
            onClick={onClose}
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>

        <div className="mt-7 flex justify-center sm:mt-8">
          <GoogleAuthButton
            className="h-11 w-full max-w-72 rounded-lg border border-[#9d3f67] px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 focus-visible:outline-[#9d3f67] sm:w-auto sm:min-w-56 [&_svg]:h-5 [&_svg]:w-5"
            isLoading={isGoogleSubmitting}
            onCredential={handleGoogleCredential}
            onError={handleGoogleError}
          />
        </div>

        <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-6 text-zinc-700 sm:mt-6">
          By continuing, you agree to our company's{' '}
          <Link
            to="/terms-and-privacy#terms"
            className="font-semibold text-[#9d3f67] hover:text-[#7f3151]"
            onClick={onClose}
          >
            Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link
            to="/terms-and-privacy#privacy"
            className="font-semibold text-[#9d3f67] hover:text-[#7f3151]"
            onClick={onClose}
          >
            Privacy Policy
          </Link>
          .
        </p>

        {submitError ? (
          <p className="mt-4 text-sm text-red-600">{submitError}</p>
        ) : null}
      </div>
    </div>
  )
}
