import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../components/common/Button'
import { setDocumentMeta } from '../utils/seo'

const OrderSuccessPage = () => {
  useEffect(() => {
    setDocumentMeta({
      title: 'Order Success | X-Box Nutrition',
      description: 'Your order has been placed successfully.',
    })
  }, [])

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="mx-auto h-14 w-14 text-lime-400" />
      <h1 className="mt-4 text-4xl font-semibold text-white">Order Confirmed</h1>
      <p className="mt-2 text-zinc-400">
        Your supplements are now being processed. You will get an email confirmation shortly.
      </p>
      <Link to="/products" className="mt-7 inline-block">
        <Button size="lg">Continue Shopping</Button>
      </Link>
    </section>
  )
}

export default OrderSuccessPage
