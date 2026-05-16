import type { CartItem } from '../types/product'

const CART_STORAGE_KEY = 'xbox_cart'
const WISHLIST_STORAGE_KEY = 'xbox_wishlist'

const isBrowser = typeof window !== 'undefined'

const readStorage = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback

  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return fallback

    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

const writeStorage = (key: string, value: unknown) => {
  if (!isBrowser) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Intentionally silent for storage quota / private mode errors.
  }
}

export const getStoredCart = (): CartItem[] => {
  return readStorage<CartItem[]>(CART_STORAGE_KEY, [])
}

export const saveStoredCart = (items: CartItem[]) => {
  writeStorage(CART_STORAGE_KEY, items)
}

export const getStoredWishlist = (): string[] => {
  return readStorage<string[]>(WISHLIST_STORAGE_KEY, [])
}

export const saveStoredWishlist = (productIds: string[]) => {
  writeStorage(WISHLIST_STORAGE_KEY, productIds)
}
