import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface WrapperOptions {
  initialEntries?: string[]
  // When a route path is provided, wraps in <Routes><Route> to enable useParams
  routePath?: string
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    routePath,
    queryClient = createTestQueryClient(),
    ...options
  }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const content = routePath ? (
      <Routes>
        <Route path={routePath} element={<>{children}</>} />
      </Routes>
    ) : (
      children
    )

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{content}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return render(ui, { wrapper: Wrapper, ...options })
}
