import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { UiSettingsProvider } from './components/lib-ui/UiSettingsContext'
import { addEnvVars } from './addEnvVars.ts'

addEnvVars();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <UiSettingsProvider>
        <App />
      </UiSettingsProvider>
    </StrictMode>
  </BrowserRouter>,
)
