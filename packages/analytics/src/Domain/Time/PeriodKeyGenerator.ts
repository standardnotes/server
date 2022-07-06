import { Period } from './Period'
import { PeriodKeyGeneratorInterface } from './PeriodKeyGeneratorInterface'

export class PeriodKeyGenerator implements PeriodKeyGeneratorInterface {
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
      default:
        throw new Error(`Unsuporrted period: ${period}`)
    }
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

  private getYesterdayDate(): Date {
    const yesterday = new Date()
    yesterday.setDate(new Date().getDate() - 1)

    return yesterday
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
}
