import { Link } from 'react-router-dom'
import { useAppSelector } from '../../hooks/useRedux'
import { Button } from '../common/Button'

export const HeroSection = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-16">
      <div>
        <p className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-wider text-lime-300">
          Premium Genuine Nutrition
        </p>
        <h1 className="mt-4 text-4xl font-bold uppercase leading-tight text-white sm:text-5xl">
          Fuel hard training with clean supplements
        </h1>
        <p className="mt-4 max-w-xl text-zinc-400">
          Shop whey, creatine, pre-workout, bars, and vitamins built for athletes who train with intent.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/products">
            <Button size="lg">Shop All Products</Button>
          </Link>
          {!isAuthenticated && !isLoading ? (
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Create Account
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_right,_rgba(163,230,53,0.2),_rgba(24,24,27,0.9)_45%)] p-6">
        <p className="text-sm text-zinc-300">Most loved combo</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Whey + Creatine Stack</h2>
        <p className="mt-3 text-sm text-zinc-400">
          Better recovery, stronger lifts, and measurable progression for your next training block.
        </p>
        <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Limited drop price</p>
          <p className="mt-2 text-3xl font-bold text-lime-400">₹84.99</p>
          <p className="mt-1 text-sm text-zinc-500 line-through">₹99.99</p>
        </div>
      </div>
    </section>
  )
}
