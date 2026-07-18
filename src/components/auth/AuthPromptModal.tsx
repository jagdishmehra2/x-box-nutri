import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GoogleAuthButton } from './GoogleAuthButton'
import { signInWithGoogle } from '../../services/authService'

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
  const [submitError, setSubmitError] = useState('')
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setSubmitError('')
      setIsGoogleSubmitting(false)
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

  const handleGoogleSignIn = async () => {
    setSubmitError('')
    setIsGoogleSubmitting(true)

    const { error } = await signInWithGoogle(getSafeRedirectPath(redirectPath))

    if (error) {
      setSubmitError(error.message)
      setIsGoogleSubmitting(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="auth-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="auth-modal-panel w-full max-w-md rounded-[18px] bg-white px-6 py-7 text-zinc-950 shadow-2xl shadow-black/30 sm:px-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="auth-modal-title"
            className="text-4xl font-semibold leading-none text-zinc-950"
          >
            Sign in
          </h2>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d3f67]"
            aria-label="Close sign in popup"
            onClick={onClose}
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="mt-8 ml-20">
          <GoogleAuthButton
            className="mx-auto h-11 w-auto min-w-56 rounded-lg border border-[#9d3f67] px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 focus-visible:outline-[#9d3f67] [&_svg]:h-5 [&_svg]:w-5"
            isLoading={isGoogleSubmitting}
            onClick={handleGoogleSignIn}
          />
        </div>

        <p className="mx-auto mt-6 max-w-sm text-center text-sm leading-6 text-zinc-700">
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
