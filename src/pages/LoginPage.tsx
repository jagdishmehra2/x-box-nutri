import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch } from '../hooks/useRedux'
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { setAuthUser } from '../features/auth/authSlice'
import {
  mapAuthUser,
  signInWithEmail,
  signInWithGoogle,
} from '../services/authService'
import { setDocumentMeta } from '../utils/seo'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    setDocumentMeta({
      title: 'Login | X-Box Nutrition',
      description: 'Log in to manage your profile, orders, and checkout quickly.',
    })
  }, [])

  const onSubmit = async (values: LoginValues) => {
    setSubmitError('')

    const { data, error } = await signInWithEmail(values.email, values.password)

    if (error) {
      setSubmitError(error.message)
      return
    }

    if (!data.user) {
      setSubmitError('Unable to sign in right now.')
      return
    }

    dispatch(
      setAuthUser(mapAuthUser(data.user)),
    )

    navigate('/', { replace: true })
  }

  const handleGoogleSignIn = async () => {
    setSubmitError('')
    setIsGoogleSubmitting(true)

    const { error } = await signInWithGoogle('/')

    if (error) {
      setSubmitError(error.message)
      setIsGoogleSubmitting(false)
      return
    }

    setIsGoogleSubmitting(false)
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Login</h1>
      <p className="mt-2 text-zinc-400">Access your account and continue checkout.</p>

      <div className="mt-6 space-y-5">
        <GoogleAuthButton
          disabled={isSubmitting}
          isLoading={isGoogleSubmitting}
          onClick={handleGoogleSignIn}
        />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase text-zinc-500">
          <span className="h-px flex-1 bg-zinc-800" />
          <span>Email login</span>
          <span className="h-px flex-1 bg-zinc-800" />
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-300">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || isGoogleSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="mt-5 text-sm text-zinc-400">
        New here?{' '}
        <Link to="/register" className="font-semibold text-lime-400 hover:text-lime-300">
          Create an account
        </Link>
      </p>
    </section>
  )
}

export default LoginPage
