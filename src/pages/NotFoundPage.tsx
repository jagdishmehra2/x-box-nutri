import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { setDocumentMeta } from '../utils/seo'

const NotFoundPage = () => {
  useEffect(() => {
    setDocumentMeta({
      title: 'Page Not Found | NutriStack',
      description: 'The page you are looking for does not exist.',
    })
  }, [])

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-white">404</h1>
      <p className="mt-3 text-zinc-400">The page you requested could not be found.</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Back to Homepage</Button>
      </Link>
    </section>
  )
}

export default NotFoundPage
