import { describe, it, expect, beforeEach } from 'vitest'
import { addPending, getPendingCount } from '@/services/offline.service'

describe('offline.service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds pending item and increments count', () => {
    addPending('testcol', { foo: 'bar' }, 'user-1')
    const count = getPendingCount()
    expect(count).toBe(1)
  })
})
