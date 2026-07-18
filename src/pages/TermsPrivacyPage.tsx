import { useEffect } from 'react'
import { setDocumentMeta } from '../utils/seo'

const TermsPrivacyPage = () => {
  useEffect(() => {
    setDocumentMeta({
      title: 'Terms and Privacy | NutriStack',
      description:
        'Read NutriStack terms and privacy policy for accounts, orders, payments, delivery, and store usage.',
    })
  }, [])

  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (!id) return

    document.getElementById(id)?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-800 pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-lime-300">
          NutriStack legal
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">
          Terms and Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          These terms explain how NutriStack accounts, checkout, delivery,
          payments, and product information work when you use this store.
        </p>
      </div>

      <div className="space-y-10 py-8">
        <section id="terms" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold text-white">
            Terms and Conditions
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-400">
            <p>
              By signing in or placing an order, you agree to use NutriStack for
              lawful personal shopping and to provide accurate account, delivery,
              and contact details.
            </p>
            <p>
              Product images, descriptions, prices, offers, availability, and
              delivery timelines may change without notice. We try to keep
              listings accurate, but final product labels and manufacturer
              instructions should be checked before use.
            </p>
            <p>
              Supplements are not a substitute for medical care. Review
              ingredients, allergens, dosage directions, and warnings carefully.
              If you are pregnant, nursing, under medical treatment, or have a
              health condition, consult a qualified professional before using any
              supplement.
            </p>
            <p>
              Orders may be cancelled, declined, or delayed if payment fails,
              stock is unavailable, shipping details are incomplete, or misuse,
              fraud, or suspicious activity is detected.
            </p>
            <p>
              Returns, replacements, and refunds depend on product condition,
              packaging, delivery status, and applicable store policy. Opened,
              used, damaged, or tampered supplement products may not be eligible
              unless required by law.
            </p>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold text-white">Privacy Policy</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-400">
            <p>
              When you continue with Google, NutriStack receives basic profile
              details such as your name, email address, avatar, and sign-in
              provider so your account can be created and recognized securely.
            </p>
            <p>
              We use account, cart, order, payment, address, and contact details
              to process purchases, calculate delivery, send order updates,
              provide support, prevent fraud, and improve the shopping
              experience.
            </p>
            <p>
              Payment processing may be handled by third-party payment services.
              NutriStack does not need to store complete card or banking details
              in the storefront to complete your order.
            </p>
            <p>
              We do not sell your personal information. We may share only the
              details needed with service providers such as authentication,
              database, payment, shipping, analytics, or support systems that
              help run the store.
            </p>
            <p>
              You can contact NutriStack support to ask about your account,
              order information, or data deletion requests, subject to legal,
              tax, fraud-prevention, and transaction record requirements.
            </p>
          </div>
        </section>
      </div>
    </section>
  )
}

export default TermsPrivacyPage
