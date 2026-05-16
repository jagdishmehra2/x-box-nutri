import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import uiReducer from '../features/ui/uiSlice'
import { saveStoredCart, saveStoredWishlist } from '../utils/storage'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
})

store.subscribe(() => {
  const state = store.getState()
  saveStoredCart(state.cart.items)
  saveStoredWishlist(state.cart.wishlist)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
