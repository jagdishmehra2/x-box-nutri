import { Outlet } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { supabase } from '../../lib/supabase'
import { getProducts } from '../../services/productService'
import {
  AIAssistant,
  createSupabaseAssistantResponder,
  createSupabaseUsageStore,
} from '../aiassistant'
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

export const MainLayout = () => {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <main>
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
    </div>
  )
}
