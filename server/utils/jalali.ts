const MONTH_LENGTHS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export const PERSIAN_WEEKDAYS = [
  'Shanbe',
  'Yek-Shanbe',
  'Do-Shanbe',
  'Se-Shanbe',
  'Cha-har-Shanbe',
  'Panj-Shanbe',
  'Jom-eh',
]

export interface JalaliParts {
  year: number
  monthIndex: number
  day: number
}

export function toJalali(date: Date): JalaliParts {
  const jy = date.getFullYear() - (date.getMonth() < 2 ? 622 : 621)
  const startOfYear = new Date(jy + 621, 2, 21)
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))

  let remaining = diffDays < 0 ? diffDays + 365 : diffDays
  let monthIndex = 0
  const jalaliYear = diffDays < 0 ? jy - 1 : jy

  for (let i = 0; i < 12; i++) {
    if (remaining < MONTH_LENGTHS[i]) {
      monthIndex = i
      break
    }
    remaining -= MONTH_LENGTHS[i]
  }

  return { year: jalaliYear, monthIndex, day: remaining + 1 }
}

export function jalaliMonthStart(date: Date): Date {
  const { year, monthIndex } = toJalali(date)
  const nowruz = new Date(year + 621, 2, 21)
  let offset = 0
  for (let i = 0; i < monthIndex; i++) offset += MONTH_LENGTHS[i]
  return new Date(nowruz.getFullYear(), nowruz.getMonth(), nowruz.getDate() + offset)
}

export function jalaliMonthLength(date: Date): number {
  return MONTH_LENGTHS[toJalali(date).monthIndex]
}
