import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

// Mock the auth module so we can control auth state without touching localStorage.
vi.mock('../lib/auth', () => {
  return {
    isAuthed: vi.fn(),
    subscribeAuthChanged: (listener: () => void) => {
      // We don't need to emit for these tests.
      return () => void listener
    },
  }
})

import { RequireAuth } from './RequireAuth'
import { isAuthed } from '../lib/auth'

function LocationDisplay() {
  const location = useLocation()
  return (
    <div data-testid="location">
      {location.pathname}
      {location.search}
    </div>
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login with next= when not authenticated', () => {
    vi.mocked(isAuthed).mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/customers?x=1']}>
        <Routes>
          <Route
            path="/customers"
            element={
              <RequireAuth>
                <div>Customers</div>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <div>Login</div>
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByTestId('location').textContent).toBe(
      '/login?next=%2Fcustomers%3Fx%3D1'
    )
  })

  it('renders children when authenticated', () => {
    vi.mocked(isAuthed).mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/customers']}>
        <Routes>
          <Route
            path="/customers"
            element={
              <RequireAuth>
                <div>Customers</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Customers')).toBeInTheDocument()
  })
})
