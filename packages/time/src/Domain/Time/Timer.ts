import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc'
import * as microtime from 'microtime'
import { Time } from './Time'
import { TimerInterface } from './TimerInterface'

export class Timer implements TimerInterface {
  constructor() {
    dayjs.extend(utc)
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
