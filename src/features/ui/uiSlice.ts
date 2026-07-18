import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isMobileMenuOpen: boolean
  isAuthModalOpen: boolean
  authRedirectPath: string
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  isAuthModalOpen: false,
  authRedirectPath: '/',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
    openAuthModal: (state, action: PayloadAction<string | undefined>) => {
      state.isAuthModalOpen = true
      state.authRedirectPath = action.payload?.startsWith('/') ? action.payload : '/'
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false
    },
  },
})

export const { closeAuthModal, openAuthModal, setMobileMenuOpen } =
  uiSlice.actions
export default uiSlice.reducer
