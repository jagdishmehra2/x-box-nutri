import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { contactInfo } from '../constants/contactInfo'
import {
  legalPageLinks,
  legalPages,
  type LegalPage,
} from '../constants/legalPages'
import { setDocumentMeta } from '../utils/seo'

const legacyLegalPath = '/terms-and-privacy'

const getCurrentLegalPage = (pathname: string) =>
  legalPages.find((page) => page.path === pathname)

interface PolicyArticleProps {
  page: LegalPage
  isSinglePage: boolean
}

const ContactChannels = () => {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {Object.values(contactInfo).map((contact) => (
        <a
          key={contact.label}
          href={contact.href}
          target={contact.href.startsWith('http') ? '_blank' : undefined}
          rel={contact.href.startsWith('http') ? 'noreferrer' : undefined}
          className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300 transition hover:border-lime-400/60 hover:text-lime-300"
        >
          <span className="block text-xs text-zinc-500">{contact.label}</span>
          <span className="mt-1 block font-medium">{contact.value}</span>
        </a>
      ))}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300">
        <span className="block text-xs text-zinc-500">Support Hours</span>
        <span className="mt-1 block font-medium">
          Monday to Saturday, 10:00 AM to 7:00 PM IST
        </span>
      </div>
    </div>
  )
}

const PolicyArticle = ({ page, isSinglePage }: PolicyArticleProps) => {
  return (
    <article id={page.slug} className="scroll-mt-28">
      {!isSinglePage && (
        <h2 className="text-3xl font-semibold text-white">{page.title}</h2>
      )}
      <p className={isSinglePage ? 'text-sm leading-6 text-zinc-400' : 'mt-3 text-sm leading-6 text-zinc-400'}>
        {page.intro}
      </p>

      <div className="mt-7 space-y-7">
        {page.sections.map((section) => (
          <section key={section.heading}>
            {isSinglePage ? (
              <h2 className="text-2xl font-semibold text-white">
                {section.heading}
              </h2>
            ) : (
              <h3 className="text-xl font-semibold text-white">
                {section.heading}
              </h3>
            )}
            <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-400">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {page.slug === 'contact-us' && <ContactChannels />}
    </article>
  )
}

const TermsPrivacyPage = () => {
  const location = useLocation()
  const currentPage = getCurrentLegalPage(location.pathname)
  const isLegacyPage = location.pathname === legacyLegalPath
  const pagesToRender = currentPage ? [currentPage] : legalPages
  const pageTitle = currentPage?.title ?? 'Store Policies'
  const pageDescription =
    currentPage?.metaDescription ??
    'Read NutriStack terms, privacy policy, shipping policy, contact details, and cancellation and refunds policy.'

  useEffect(() => {
    setDocumentMeta({
      title: `${pageTitle} | NutriStack`,
      description: pageDescription,
    })
  }, [pageDescription, pageTitle])

  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (!id) return

    const timeoutId = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [location.hash, location.pathname])

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-800 pb-6">
        <p className="text-sm font-semibold uppercase text-lime-300">
          NutriStack legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          {pageTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          {currentPage?.intro ??
            'Mandatory store policies and contact details for NutriStack customers.'}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Last updated: August 1, 2026
        </p>
      </div>

      <nav
        aria-label="Legal pages"
        className="flex flex-wrap gap-x-5 gap-y-3 border-b border-zinc-800 py-5 text-sm"
      >
        {legalPageLinks.map((link) => {
          const isActive = location.pathname === link.to

          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'font-semibold text-lime-300'
                  : 'font-medium text-zinc-400 transition hover:text-lime-300'
              }
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className={isLegacyPage ? 'space-y-12 py-8' : 'py-8'}>
        {pagesToRender.map((page) => (
          <PolicyArticle
            key={page.slug}
            page={page}
            isSinglePage={Boolean(currentPage)}
          />
        ))}
      </div>
    </section>
  )
}

export default TermsPrivacyPage
