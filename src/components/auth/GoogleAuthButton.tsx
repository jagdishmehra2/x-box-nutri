import { Button } from '../common/Button'
import { cn } from '../../utils/cn'

interface GoogleAuthButtonProps {
  className?: string
  disabled?: boolean
  isLoading?: boolean
  loadingLabel?: string
  onClick: () => void
}

export const GoogleAuthButton = ({
  className,
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
      className={cn(
        'w-full gap-3 border border-zinc-700 bg-white text-zinc-950 hover:bg-zinc-100 focus-visible:outline-zinc-300',
        className,
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 35.5 24 35.5c-6.4 0-11.7-4.4-13.2-10.3-.3-1-.5-2.1-.5-3.2s.2-2.2.5-3.2C12.3 12.9 17.6 8.5 24 8.5c3.4 0 6.4 1.2 8.8 3.3l5.7-5.7C34.9 2.6 29.7.5 24 .5 11.5.5 1.5 10.5 1.5 23S11.5 45.5 24 45.5c12 0 22-8.7 22-22 0-1.5-.2-2.7-.4-3z"
        />
        <path
          fill="#FF3D00"
          d="M3.2 13.5l6.6 4.8C11.7 14.1 17.4 10.5 24 10.5c3.4 0 6.4 1.2 8.8 3.3l5.7-5.7C34.9 4.6 29.7 2.5 24 2.5c-9.1 0-16.9 5.2-20.8 11z"
        />
        <path
          fill="#4CAF50"
          d="M24 45.5c5.6 0 10.7-1.9 14.6-5.2l-6.7-5.5c-2.2 1.5-5 2.4-7.9 2.4-5.3 0-9.7-2.9-11.7-7.1l-6.6 5.1C9 40.3 16 45.5 24 45.5z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-1 2.6-2.8 4.8-5.1 6.3l6.7 5.5c3.9-3.6 6.6-9 6.6-15.8 0-1.5-.2-2.7-.4-3z"
        />
      </svg>
      {isLoading ? loadingLabel : 'Continue with Google'}
    </Button>
  )
}
