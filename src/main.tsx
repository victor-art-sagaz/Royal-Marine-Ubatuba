import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// App instalável (PWA): registra o service worker só no site publicado (não no Codespaces nem no computador)
const isPreview =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.hostname.endsWith('.app.github.dev')
if (!isPreview && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Se não conseguir, o site continua funcionando normalmente
    })
  })
}
