import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import './i18n'
import { ActiveFarmProvider } from './context/ActiveFarmContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0, // Always refetch on invalidation; per-query staleTime handles normal caching
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ActiveFarmProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ActiveFarmProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
