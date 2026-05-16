import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './app/store'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #3f3f46',
          },
        }}
      />
    </Provider>
  </StrictMode>,
)
