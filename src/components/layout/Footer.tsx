export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold text-zinc-100">X-BOX NUTRITION</p>
          <p className="mt-1 text-sm text-zinc-400">
            Premium supplements for strength, recovery, and performance.
          </p>
        </div>
        <p className="text-sm text-zinc-500">© {currentYear} X-Box Nutrition. All rights reserved.</p>
      </div>
    </footer>
  )
}
