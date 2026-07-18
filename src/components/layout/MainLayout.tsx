import { useCallback, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux'
import { closeAuthModal, openAuthModal } from '../../features/ui/uiSlice'
import { supabase } from '../../lib/supabase'
import { getProducts } from '../../services/productService'
import {
  AIAssistant,
  createSupabaseAssistantResponder,
  createSupabaseUsageStore,
} from '../aiassistant'
import { AuthPromptModal } from '../auth/AuthPromptModal'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

const aiResponder = supabase
  ? createSupabaseAssistantResponder(supabase)
  : undefined
const aiUsageStore = supabase ? createSupabaseUsageStore(supabase) : undefined

const assistantCategoryByQuery: Record<string, string> = {
  'whey protein': 'Whey Protein',
  creatine: 'Creatine',
  multivitamins: 'Multivitamin',
  'pre workout': 'Pre Workout',
}

const normalizeSubtypeQuery = (query: string) =>
  query.toLowerCase().replace(/^(whey|creatine)\s+/, '').trim()

const searchAssistantProducts = async (
  query: string,
  scope: 'catalog' | 'subtype' = 'catalog',
) => {
  const result = await getProducts({
    ...(scope === 'subtype'
      ? { subtype: normalizeSubtypeQuery(query) }
      : { category: assistantCategoryByQuery[query.toLowerCase()] }),
    limit: 8,
  })
  return result.products
}

interface AuthLocationState {
  authModal?: {
    redirectPath?: string
  }
}

export const MainLayout = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { authRedirectPath, isAuthModalOpen } = useAppSelector((state) => state.ui)
  const authModalState = (location.state as AuthLocationState | null)?.authModal
  const handleCloseAuthModal = useCallback(() => {
    dispatch(closeAuthModal())
  }, [dispatch])

  useEffect(() => {
    if (!authModalState) return

    dispatch(openAuthModal(authModalState.redirectPath))
    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: null,
    })
  }, [
    authModalState,
    dispatch,
    location.hash,
    location.pathname,
    location.search,
    navigate,
  ])

  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      dispatch(closeAuthModal())
    }
  }, [dispatch, isAuthenticated, isAuthModalOpen])

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <AIAssistant
        searchProducts={searchAssistantProducts}
        userId={user?.id}
        brandName="NutriStack"
        responder={aiResponder}
        usageStore={aiUsageStore}
      />
      <AuthPromptModal
        open={!isAuthenticated && isAuthModalOpen}
        redirectPath={authRedirectPath}
        onClose={handleCloseAuthModal}
      />
    </div>
  )
}
