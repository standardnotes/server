import { TimeStructure } from './TimeStructure'

export interface TimerInterface {
  getTimestampInMicroseconds(): number
  getTimestampInSeconds(): number
  getUTCDate(): Date
  getUTCDateNDaysAgo(n: number): Date
  getUTCDateNDaysAhead(n: number): Date
  getUTCDateNHoursAgo(n: number): Date
  getUTCDateNHoursAhead(n: number): Date
  getUTCDateNSecondsAhead(n: number): Date
  getUTCDateNMinutesAgo(n: number): Date
  convertDateToMilliseconds(date: Date): number
  convertDateToMicroseconds(date: Date): number
  convertDateToISOString(date: Date): string
  convertDateToFormattedString(date: Date, format: string): string
  convertStringDateToDate(date: string): Date
  convertStringDateToMicroseconds(date: string): number
  convertStringDateToMilliseconds(date: string): number
  convertStringDateToSeconds(date: string): number
  convertMicrosecondsToMilliseconds(microseconds: number): number
  convertMicrosecondsToSeconds(microseconds: number): number
  convertMicrosecondsToStringDate(microseconds: number): string
  convertMicrosecondsToDate(microseconds: number): Date
  convertMicrosecondsToTimeStructure(microseconds: number): TimeStructure
  formatDate(date: Date, format: string): string
  dateWasNDaysAgo(date: Date): number
  sleep(milliseconds: number): Promise<void>
}
