import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../types/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.isAuthenticated = Boolean(action.payload)
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setAuthLoading, setAuthUser, logout } = authSlice.actions
export default authSlice.reducer
