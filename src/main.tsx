import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import axios from 'axios'
import { toast } from 'sonner'
import './styles/index.css'

// Global interceptor to catch Rate Limit (429) errors from the backend
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      window.dispatchEvent(new Event('rate-limit-exceeded'));
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
)
