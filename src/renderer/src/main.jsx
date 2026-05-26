import './assets/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// O React não pode ter código de ipcMain ou electron-store aqui!

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)