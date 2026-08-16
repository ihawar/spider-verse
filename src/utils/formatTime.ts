export function secondsToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

export function secondsToHM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.round((totalSeconds % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

export function secondsToHours(totalSeconds: number): number {
  return +(totalSeconds / 3600).toFixed(1)
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const JALALI_MONTHS = [
  'Farvardin', 'Ordibehesht', 'Khordad',
  'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar',
  'Dey', 'Bahman', 'Esfand',
]

export function toPersianDate(date: Date): string {
  const jy: number = date.getFullYear() - (date.getMonth() < 2 ? 622 : 621)

  const startOfYear = new Date(jy + 621, 2, 21)
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))

  let remaining = diffDays < 0 ? diffDays + 365 : diffDays
  let monthIndex = 0
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  const jalaliYear = diffDays < 0 ? jy - 1 : jy

  for (let i = 0; i < 12; i++) {
    if (remaining < monthLengths[i]) {
      monthIndex = i
      break
    }
    remaining -= monthLengths[i]
  }

  return `${remaining + 1} ${JALALI_MONTHS[monthIndex]} ${jalaliYear}`
}

export function toPersianDateParts(date: Date): { day: number; month: string; year: number } {
  const jy: number = date.getFullYear() - (date.getMonth() < 2 ? 622 : 621)

  const startOfYear = new Date(jy + 621, 2, 21)
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))

  let remaining = diffDays < 0 ? diffDays + 365 : diffDays
  let monthIndex = 0
  const monthLengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  const jalaliYear = diffDays < 0 ? jy - 1 : jy

  for (let i = 0; i < 12; i++) {
    if (remaining < monthLengths[i]) {
      monthIndex = i
      break
    }
    remaining -= monthLengths[i]
  }

  return { day: remaining + 1, month: JALALI_MONTHS[monthIndex], year: jalaliYear }
}
