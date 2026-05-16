import { useEffect } from 'react'
import { setDocumentMeta } from '../utils/seo'

const OrdersPage = () => {
  useEffect(() => {
    setDocumentMeta({
      title: 'Orders | X-Box Nutrition',
      description: 'Track your previous and current X-Box Nutrition orders.',
    })
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold text-white">Orders</h1>
      <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Your order history will appear here once checkout and order APIs are connected.
        </p>
      </article>
    </section>
  )
}

export default OrdersPage
