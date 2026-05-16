import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
