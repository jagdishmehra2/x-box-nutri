import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader } from '../components/common/Loader'
import { useAppSelector } from '../hooks/useRedux'
import { setDocumentMeta } from '../utils/seo'

const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  const nextPath = searchParams.get('next')
  const safeNextPath = nextPath && nextPath.startsWith('/') ? nextPath : '/'

  useEffect(() => {
    setDocumentMeta({
      title: 'Signing In | X-Box Nutrition',
      description: 'Completing secure Google sign-in.',
    })
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      navigate(safeNextPath, { replace: true })
      return
    }

    navigate('/login', { replace: true })
  }, [isAuthenticated, isLoading, navigate, safeNextPath])

  return <Loader />
}

export default AuthCallbackPage
