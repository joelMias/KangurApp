import { formatSecondsToMMSS } from '@/utils/time'

describe('formatSecondsToMMSS', () => {
  it('formats seconds less than a minute as 00:SS', () => {
    expect(formatSecondsToMMSS(5)).toBe('00:05')
  })

  it('formats minutes and seconds correctly', () => {
    expect(formatSecondsToMMSS(75)).toBe('01:15')
    expect(formatSecondsToMMSS(3605)).toBe('60:05')
  })
})
