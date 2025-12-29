export function formatSecondsToMMSS(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function formatSecondsToReadable(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const remainder = totalSeconds % 3600
  const minutes = Math.floor(remainder / 60)
  const seconds = remainder % 60

  if (hours > 0) {
    const hourLabel = hours === 1 ? 'hora' : 'hores'
    return `${hours} ${hourLabel} ${minutes} min ${seconds} segons`
  }

  if (minutes === 0) {
    return `${seconds} segons`
  }

  return `${minutes} min ${seconds} segons`
}

export default { formatSecondsToMMSS, formatSecondsToReadable }
