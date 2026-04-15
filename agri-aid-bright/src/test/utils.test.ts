// Utility function tests
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  it('combines classes correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toBe('base conditional')
  })

  it('merges conflicting tailwind classes', () => {
    const result = cn('p-4', 'p-6')
    expect(result).toBe('p-6')
  })
})