// Navigation component tests
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Navigation from '@/components/Navigation'

const NavigationWithRouter = () => (
  <BrowserRouter>
    <Navigation />
  </BrowserRouter>
)

describe('Navigation', () => {
  it('renders navigation links', () => {
    const { getByText } = render(<NavigationWithRouter />)
    
    expect(getByText(/AgriAid/i)).toBeInTheDocument()
  })

  it('has correct navigation structure', () => {
    const { container } = render(<NavigationWithRouter />)
    
    expect(container.querySelector('nav')).toBeInTheDocument()
  })
})