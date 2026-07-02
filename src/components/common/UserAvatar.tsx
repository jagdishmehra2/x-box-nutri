import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '../../utils/cn'

type UserAvatarProps = {
  src?: string
  name?: string
  size?: 'sm' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-10 w-10',
  lg: 'h-32 w-32',
}

const iconSizeClasses = {
  sm: 'h-5 w-5',
  lg: 'h-16 w-16',
}

export const UserAvatar = ({
  src,
  name,
  size = 'sm',
  className,
}: UserAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [src])

  const classes = cn(
    'shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800',
    sizeClasses[size],
    className,
  )

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name ? `${name}'s profile` : 'User profile'}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={cn(classes, 'object-cover')}
      />
    )
  }

  return (
    <span
      className={cn(classes, 'inline-flex items-center justify-center text-zinc-300')}
      role="img"
      aria-label={name ? `${name}'s profile` : 'Default user avatar'}
    >
      <UserRound className={iconSizeClasses[size]} aria-hidden="true" />
    </span>
  )
}
