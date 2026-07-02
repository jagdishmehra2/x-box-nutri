import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useAppDispatch } from './hooks/useRedux'
import { setAuthLoading, setAuthUser } from './features/auth/authSlice'
import { supabase } from './lib/supabase'
import { router } from './routes/AppRouter'
import { mapAuthUser } from './services/authService'

const App = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!supabase) {
      dispatch(setAuthLoading(false))
      return
    }

    dispatch(setAuthLoading(true))

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      dispatch(
        setAuthUser(
          user ? mapAuthUser(user) : null,
        ),
      )
      dispatch(setAuthLoading(false))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user
      dispatch(
        setAuthUser(
          user ? mapAuthUser(user) : null,
        ),
      )
      dispatch(setAuthLoading(false))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return <RouterProvider router={router} />
}

export default App
