// Index page tests
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Index from '@/pages/Index'

const IndexWithRouter = () => (
  <BrowserRouter>
    <Index />
  </BrowserRouter>
)

describe('Index Page', () => {
  it('renders hero section with main heading', () => {
    const { getByText } = render(<IndexWithRouter />)
    
    expect(getByText(/AI-Powered Crop Disease Detection/i)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    const { getAllByRole } = render(<IndexWithRouter />)
    
    const buttons = getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('displays feature cards', () => {
    const { container } = render(<IndexWithRouter />)
    
    // Look for feature-related text
    expect(container.textContent).toMatch(/Quick Detection|Accurate Analysis|Expert Recommendations/i)
  })
})