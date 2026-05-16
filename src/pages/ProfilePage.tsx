import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { Button } from '../components/common/Button'
import { logout } from '../features/auth/authSlice'
import { signOutUser } from '../services/authService'
import { setDocumentMeta } from '../utils/seo'

const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    setDocumentMeta({
      title: 'Profile | X-Box Nutrition',
      description: 'Manage your X-Box Nutrition profile and account settings.',
    })
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Profile</h1>
      <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-sm text-zinc-400">Logged in as</p>
        <p className="mt-1 text-lg font-medium text-white">{user?.email}</p>

        <Button
          variant="secondary"
          className="mt-6"
          onClick={async () => {
            await signOutUser()
            dispatch(logout())
          }}
        >
          Logout
        </Button>
      </article>
    </section>
  )
}

export default ProfilePage
