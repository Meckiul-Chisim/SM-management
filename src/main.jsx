import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (bundled by Vite, no third-party requests).
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/instrument-sans'
import App from './app/App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
