import { faqs } from '../../constants/faqs'

export const FaqSection = () => {
  return (
    <section className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
            Need help?
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-zinc-400">
            Quick answers about our products, payments, shipping, and returns.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {faqs.map((faq) => (
            <article
              key={faq.id}
              className="flex min-h-56 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
            >
              <div className="flex min-h-20 items-center border-b border-zinc-800 bg-zinc-900 px-5 py-5">
                <h3 className="text-lg font-semibold leading-7 text-white">
                  {faq.question}
                </h3>
              </div>
              <p className="flex-1 px-5 py-5 text-sm leading-6 text-zinc-400">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
