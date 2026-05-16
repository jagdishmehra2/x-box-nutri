import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  value: number
  onChange: (nextValue: number) => void
}

export const QuantitySelector = ({ value, onChange }: QuantitySelectorProps) => {
  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900">
      <button
        className="px-3 py-2 text-zinc-300 hover:bg-zinc-800"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-10 text-center text-sm font-medium text-white">{value}</span>
      <button
        className="px-3 py-2 text-zinc-300 hover:bg-zinc-800"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
