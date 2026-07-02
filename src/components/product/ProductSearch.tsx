import { type FormEvent, useId } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '../common/Button'

type ProductSearchProps = {
  value: string
  onChange: (value: string) => void
  onSearch: (value: string) => void
  isLoading?: boolean
  placeholder?: string
}

export const ProductSearch = ({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = 'Search products by name',
}: ProductSearchProps) => {
  const inputId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch(value.trim())
  }

  const handleClear = () => {
    onChange('')
    onSearch('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />

        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-10 pr-10 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-zinc-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-400"
            aria-label="Clear product search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        Search
      </Button>
    </form>
  )
}
