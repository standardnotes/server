import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as microtime from 'microtime'
import { Time } from './Time'
import { TimerInterface } from './TimerInterface'
import { TimeStructure } from './TimeStructure'

export class Timer implements TimerInterface {
  constructor() {
    dayjs.extend(utc)
  }

  /* istanbul ignore next */
  async sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }

  getUTCDateNSecondsAhead(n: number): Date {
    return dayjs.utc().add(n, 'second').toDate()
  }

  convertMicrosecondsToTimeStructure(microseconds: number): TimeStructure {
    const days = Math.floor(microseconds / Time.MicrosecondsInADay)

    const hoursLeftOver = microseconds % Time.MicrosecondsInADay
    const hours = Math.floor(hoursLeftOver / Time.MicrosecondsInAnHour)

    const minutesLeftOver = microseconds % Time.MicrosecondsInAnHour
    const minutes = Math.floor(minutesLeftOver / Time.MicrosecondsInAMinute)

    const secondsLeftOver = microseconds % Time.MicrosecondsInAMinute
    const seconds = Math.floor(secondsLeftOver / Time.MicrosecondsInASecond)

    const millisecondsLeftOver = microseconds % Time.MicrosecondsInASecond
    const milliseconds = Math.floor(millisecondsLeftOver / Time.MicrosecondsInAMillisecond)

    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    }
  }

  formatDate(date: Date, format: string): string {
    return dayjs.utc(date).format(format)
  }

  convertDateToMilliseconds(date: Date): number {
    return this.convertStringDateToMilliseconds(date.toString())
  }

  convertDateToMicroseconds(date: Date): number {
    return this.convertStringDateToMicroseconds(date.toString())
  }

  convertMicrosecondsToSeconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInASecond)
  }

  getTimestampInMicroseconds(): number {
    return microtime.now()
  }

  getTimestampInSeconds(): number {
    return this.convertMicrosecondsToSeconds(this.getTimestampInMicroseconds())
  }

  getUTCDate(): Date {
    return dayjs.utc().toDate()
  }

  getUTCDateNDaysAgo(n: number): Date {
    return dayjs.utc().subtract(n, 'days').toDate()
  }

  getUTCDateNDaysAhead(n: number): Date {
    return dayjs.utc().add(n, 'days').toDate()
  }

  getUTCDateNHoursAgo(n: number): Date {
    return dayjs.utc().subtract(n, 'hours').toDate()
  }

  getUTCDateNHoursAhead(n: number): Date {
    return dayjs.utc().add(n, 'hours').toDate()
  }

  convertStringDateToDate(date: string): Date {
    return dayjs.utc(date).toDate()
  }

  convertDateToISOString(date: Date): string {
    return dayjs.utc(date).toISOString()
  }

  convertDateToFormattedString(date: Date, format: string): string {
    return dayjs.utc(date).format(format)
  }

  dateWasNDaysAgo(date: Date): number {
    return dayjs.utc().diff(date, 'days')
  }

  convertStringDateToMicroseconds(date: string): number {
    return this.convertStringDateToMilliseconds(date) * Time.MicrosecondsInAMillisecond
  }

  convertStringDateToMilliseconds(date: string): number {
    return dayjs.utc(date).valueOf()
  }

  convertStringDateToSeconds(date: string): number {
    return this.convertMicrosecondsToSeconds(this.convertStringDateToMicroseconds(date))
  }

  convertMicrosecondsToMilliseconds(microseconds: number): number {
    return Math.floor(microseconds / Time.MicrosecondsInAMillisecond)
  }

  convertMicrosecondsToStringDate(microseconds: number): string {
    const milliseconds = this.convertMicrosecondsToMilliseconds(microseconds)

    const microsecondsString = microseconds.toString().substring(13)

    return dayjs.utc(milliseconds).format(`YYYY-MM-DDTHH:mm:ss.SSS${microsecondsString}[Z]`)
  }

  convertMicrosecondsToDate(microseconds: number): Date {
    return this.convertStringDateToDate(this.convertMicrosecondsToStringDate(microseconds))
  }
}
