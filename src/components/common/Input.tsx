import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}
