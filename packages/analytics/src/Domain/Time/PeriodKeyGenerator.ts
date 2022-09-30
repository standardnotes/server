import { Period } from './Period'
import { PeriodKeyGeneratorInterface } from './PeriodKeyGeneratorInterface'

export class PeriodKeyGenerator implements PeriodKeyGeneratorInterface {
  getDiscretePeriodKeys(period: Period): string[] {
    const periodKeys = []

    switch (period) {
      case Period.Last30Days:
        for (let i = 1; i <= 30; i++) {
          periodKeys.unshift(this.getDailyKey(this.getDateNDaysBefore(i)))
        }

        return periodKeys
      case Period.Last7Days:
        for (let i = 1; i <= 7; i++) {
          periodKeys.unshift(this.getDailyKey(this.getDateNDaysBefore(i)))
        }

        return periodKeys
      case Period.Q1ThisYear:
        return this.generateMonthlyKeysRange(0, 3)
      case Period.Q2ThisYear:
        return this.generateMonthlyKeysRange(3, 6)
      case Period.Q3ThisYear:
        return this.generateMonthlyKeysRange(6, 9)
      case Period.Q4ThisYear:
        return this.generateMonthlyKeysRange(9, 12)
      default:
        throw new Error(`Unsuporrted period: ${period}`)
    }
  }

  getPeriodKey(period: Period): string {
    switch (period) {
      case Period.Today:
        return this.getDailyKey()
      case Period.Yesterday:
        return this.getDailyKey(this.getYesterdayDate())
      case Period.DayBeforeYesterday:
        return this.getDailyKey(this.getDayBeforeYesterdayDate())
      case Period.ThisWeek:
        return this.getWeeklyKey()
      case Period.LastWeek:
        return this.getWeeklyKey(this.getLastWeekDate())
      case Period.WeekBeforeLastWeek:
        return this.getWeeklyKey(this.getWeekBeforeLastWeekDate())
      case Period.ThisMonth:
        return this.getMonthlyKey()
      case Period.LastMonth:
        return this.getMonthlyKey(this.getLastMonthDate())
      case Period.ThisYear:
        return this.getYearlyKey()
      default:
        throw new Error(`Unsuporrted period: ${period}`)
    }
  }

  private getYearlyKey(date?: Date): string {
    date = date ?? new Date()

    return this.getYear(date)
  }

  private getMonthlyKey(date?: Date): string {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}`
  }

  private getDailyKey(date?: Date): string {
    date = date ?? new Date()

    return `${this.getYear(date)}-${this.getMonth(date)}-${this.getDayOfTheMonth(date)}`
  }

  private getWeeklyKey(date?: Date): string {
    date = date ?? new Date()

    const firstJanuary = new Date(date.getFullYear(), 0, 1)

    const numberOfDaysPassed = Math.floor((date.getTime() - firstJanuary.getTime()) / (24 * 60 * 60 * 1000))

    const weekNumber = Math.ceil((date.getDay() + 1 + numberOfDaysPassed) / 7)

    return `${this.getYear(date)}-week-${weekNumber}`
  }

  private getYear(date: Date): string {
    return date.getFullYear().toString()
  }

  private getMonth(date: Date): string {
    return (date.getMonth() + 1).toString()
  }

  private getDayOfTheMonth(date: Date): string {
    return date.getDate().toString()
  }

  private getDateNDaysBefore(n: number) {
    const date = new Date()
    date.setDate(new Date().getDate() - n)

    return date
  }

  private getYesterdayDate(): Date {
    return this.getDateNDaysBefore(1)
  }

  private getDayBeforeYesterdayDate(): Date {
    const dayBeforeYesterday = new Date()
    dayBeforeYesterday.setDate(new Date().getDate() - 2)

    return dayBeforeYesterday
  }

  private getLastWeekDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 7)

    return yesterday
  }

  private getLastMonthDate(): Date {
    const lastMonth = new Date()
    lastMonth.setDate(1)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return lastMonth
  }

  private getWeekBeforeLastWeekDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 14)

    return yesterday
  }

  private generateMonthlyKeysRange(startingMonthIndex: number, endingMonthIndex: number): string[] {
    const today = new Date()
    const keys = []
    for (let i = startingMonthIndex; i < endingMonthIndex; i++) {
      today.setMonth(i)
      today.setDate(1)
      keys.push(this.getMonthlyKey(today))
    }

    return keys
  }
}
