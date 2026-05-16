import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isMobileMenuOpen: boolean
}

const initialState: UiState = {
  isMobileMenuOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload
    },
  },
})

export const { setMobileMenuOpen } = uiSlice.actions
export default uiSlice.reducer
