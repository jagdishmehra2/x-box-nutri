import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '../components/common/Loader'
import { useAppSelector } from '../hooks/useRedux'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{
          authModal: {
            redirectPath: `${location.pathname}${location.search}${location.hash}`,
          },
        }}
        replace
      />
    )
  }

  return <>{children}</>
}
