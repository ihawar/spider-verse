import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoadingOverlay from './components/LoadingOverlay'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <LoadingOverlay />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
