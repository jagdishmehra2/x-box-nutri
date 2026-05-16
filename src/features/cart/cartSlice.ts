import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getStoredCart, getStoredWishlist } from '../../utils/storage'
import type { CartItem, Product } from '../../types/product'

interface CartState {
  items: CartItem[]
  wishlist: string[]
}

const initialState: CartState = {
  items: getStoredCart(),
  wishlist: getStoredWishlist(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id,
      )

      if (existingItem) {
        existingItem.quantity += 1
        return
      }

      state.items.push({ product: action.payload, quantity: 1 })
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      )
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload
      const targetItem = state.items.find((item) => item.product.id === productId)

      if (!targetItem) return

      targetItem.quantity = Math.max(1, quantity)
    },
    clearCart: (state) => {
      state.items = []
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload
      const alreadySaved = state.wishlist.includes(productId)

      if (alreadySaved) {
        state.wishlist = state.wishlist.filter((id) => id !== productId)
        return
      }

      state.wishlist.push(productId)
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleWishlist,
} = cartSlice.actions

export default cartSlice.reducer
