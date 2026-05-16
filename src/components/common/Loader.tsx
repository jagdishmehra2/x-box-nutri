export const Loader = () => {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-lime-400" />
      <span className="sr-only">Loading page content</span>
    </div>
  )
}
