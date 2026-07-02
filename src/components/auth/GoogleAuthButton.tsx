import { Button } from '../common/Button'

interface GoogleAuthButtonProps {
  disabled?: boolean
  isLoading?: boolean
  loadingLabel?: string
  onClick: () => void
}

export const GoogleAuthButton = ({
  disabled = false,
  isLoading = false,
  loadingLabel = 'Connecting...',
  onClick,
}: GoogleAuthButtonProps) => {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full gap-3 border border-zinc-700 bg-white text-zinc-950 hover:bg-zinc-100 focus-visible:outline-zinc-300"
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 place-items-center rounded-full border border-zinc-300 bg-white text-sm font-bold text-blue-600"
      >
        G
      </span>
      {isLoading ? loadingLabel : 'Continue with Google'}
    </Button>
  )
}
