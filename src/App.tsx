import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import AppLayout from './components/AppLayout/AppLayout'
import MainPage from './pages/MainPage'
import DetailsPage from './pages/DetailsPage'

const HistoryPage = lazy(() => import('./pages/HistoryPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/breeds/:id" element={<DetailsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
