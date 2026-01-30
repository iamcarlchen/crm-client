import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

vi.mock('../lib/auth', () => {
  return {
    isAdmin: vi.fn(),
    subscribeAuthChanged: (listener: () => void) => {
      return () => void listener
    },
  }
})

import { RequireAdmin } from './RequireAdmin'
import { isAdmin } from '../lib/auth'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

describe('RequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /dashboard when not admin', () => {
    vi.mocked(isAdmin).mockReturnValue(false)

    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route
            path="/employees"
            element={
              <RequireAdmin>
                <div>Employees</div>
              </RequireAdmin>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <div>Dashboard</div>
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('location').textContent).toBe('/dashboard')
  })

  it('renders children when admin', () => {
    vi.mocked(isAdmin).mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/employees']}>
        <Routes>
          <Route
            path="/employees"
            element={
              <RequireAdmin>
                <div>Employees</div>
              </RequireAdmin>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Employees')).toBeInTheDocument()
  })
})
