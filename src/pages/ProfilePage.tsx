import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { UserAvatar } from '../components/common/UserAvatar'
import { logout } from '../features/auth/authSlice'
import { signOutUser } from '../services/authService'
import { setDocumentMeta } from '../utils/seo'

const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  useEffect(() => {
    setDocumentMeta({
      title: 'Profile | NutriStack',
      description: 'Manage your NutriStack profile and account settings.',
    })
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOutUser()
      dispatch(logout())
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to log out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const providerName = user?.provider
    ? `${user.provider.charAt(0).toUpperCase()}${user.provider.slice(1)}`
    : 'Email'

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available'

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-center text-4xl font-semibold text-white">Profile</h1>
      <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <UserAvatar
            src={user?.avatarUrl}
            name={user?.fullName}
            size="lg"
            className="border-2 border-lime-400"
          />

          <h2 className="mt-4 text-2xl font-semibold text-white">
            {user?.fullName || 'Customer'}
          </h2>
          <p className="mt-1 text-zinc-400">{user?.email}</p>
        </div>

        <dl className="mx-auto mt-8 max-w-xl divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/60 px-5">
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">Full name</dt>
            <dd className="text-right text-sm font-medium text-white">
              {user?.fullName || 'Not available'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">Email address</dt>
            <dd className="break-all text-right text-sm font-medium text-white">
              {user?.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">Sign-in method</dt>
            <dd className="text-right text-sm font-medium text-white">
              {providerName}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-zinc-500">Member since</dt>
            <dd className="text-right text-sm font-medium text-white">
              {memberSince}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </article>
    </section>
  )
}

export default ProfilePage
