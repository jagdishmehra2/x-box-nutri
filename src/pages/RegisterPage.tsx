import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { setAuthUser } from '../features/auth/authSlice'
import { signUpWithEmail } from '../services/authService'
import { setDocumentMeta } from '../utils/seo'

const registerSchema = z
  .object({
    email: z.email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type RegisterValues = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    setDocumentMeta({
      title: 'Register | X-Box Nutrition',
      description:
        'Create your X-Box Nutrition account for faster checkout and order tracking.',
    })
  }, [])

  const onSubmit = async (values: RegisterValues) => {
    setSubmitError('')
    setSubmitSuccess('')

    const { data, error } = await signUpWithEmail(values.email, values.password)

    if (error) {
      setSubmitError(error.message)
      return
    }

    if (data.user) {
      dispatch(
        setAuthUser({
          id: data.user.id,
          email: data.user.email ?? values.email,
        }),
      )
      navigate('/profile', { replace: true })
      return
    }

    setSubmitSuccess('Account created. Please verify your email before logging in.')
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Create Account</h1>
      <p className="mt-2 text-zinc-400">Get access to fast checkout and order history.</p>

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
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-zinc-300"
          >
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}
        {submitSuccess ? <p className="text-sm text-lime-400">{submitSuccess}</p> : null}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-5 text-sm text-zinc-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-lime-400 hover:text-lime-300">
          Login
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
