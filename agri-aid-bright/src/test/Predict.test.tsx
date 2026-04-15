// Predict page tests
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Predict from '@/pages/Predict'

const PredictWithRouter = () => (
  <BrowserRouter>
    <Predict />
  </BrowserRouter>
)

describe('Predict Page', () => {
  it('renders disease prediction interface', () => {
    const { getByText } = render(<PredictWithRouter />)
    
    expect(getByText(/AI Disease Prediction/i)).toBeInTheDocument()
  })

  it('displays crop selection dropdown', () => {
    const { getByText } = render(<PredictWithRouter />)
    
    expect(getByText(/Choose Crop Type/i)).toBeInTheDocument()
  })

  it('shows image upload section', () => {
    const { getByText } = render(<PredictWithRouter />)
    
    expect(getByText(/Upload Crop Image/i)).toBeInTheDocument()
  })

  it('displays tips for better results', () => {
    const { getByText } = render(<PredictWithRouter />)
    
    expect(getByText(/Tips for better results/i)).toBeInTheDocument()
  })
})