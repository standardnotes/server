import 'reflect-metadata'

import { Timer } from './Timer'

describe('Timer', () => {
  const createTimer = () => new Timer()

  it('should return a timestamp in microseconds', () => {
    const timestamp = createTimer().getTimestampInMicroseconds()
    expect(`${timestamp}`.length).toEqual(16)
  })

  it('should return a timestamp in seconds', () => {
    const timestamp = createTimer().getTimestampInSeconds()
    expect(`${timestamp}`.length).toEqual(10)
  })

  it('should return a utc date', () => {
    const date = createTimer().getUTCDate()
    expect(date).toBeInstanceOf(Date)
  })

  it('should return a utc date n days ago', () => {
    const date = createTimer().getUTCDate()
    const dateNDaysAgo = createTimer().getUTCDateNDaysAgo(4)

    expect(+date - +dateNDaysAgo >= 4 * 24 * 3600).toBeTruthy()
  })

  it('should return a utc date n days ahead', () => {
    const date = createTimer().getUTCDate()
    const dateNDaysAhead = createTimer().getUTCDateNDaysAhead(4)

    expect(+dateNDaysAhead - +date >= 4 * 24 * 3600).toBeTruthy()
  })

  it('should calculate days difference between now and a given date', () => {
    const dateNDaysAgo = createTimer().getUTCDateNDaysAgo(4)

    expect(createTimer().dateWasNDaysAgo(dateNDaysAgo)).toEqual(4)
  })

  it('should return a utc date n hours ago', () => {
    const date = createTimer().getUTCDate()
    const dateNHoursAgo = createTimer().getUTCDateNHoursAgo(4)

    expect(+date - +dateNHoursAgo >= 4 * 3600).toBeTruthy()
  })

  it('should return a utc date n hours ahead', () => {
    const date = createTimer().getUTCDate()
    const dateNHoursAhead = createTimer().getUTCDateNHoursAhead(4)

    expect(+dateNHoursAhead - +date >= 4 * 3600).toBeTruthy()
  })

  it('should convert a date to milliseconds', () => {
    const timestamp = createTimer().convertDateToMilliseconds(new Date(Date.UTC(2021, 2, 29, 12, 13, 45)))
    expect(timestamp).toEqual(1617020025000)
  })

  it('should convert a date to microseconds', () => {
    const timestamp = createTimer().convertDateToMicroseconds(new Date(Date.UTC(2021, 2, 29, 8, 0, 5, 233)))
    expect(timestamp).toEqual(1617004805000000)
  })

  it('should convert a date to iso string', () => {
    const isoString = createTimer().convertDateToISOString(new Date(Date.UTC(2021, 2, 29, 8, 0, 5)))
    expect(isoString).toEqual('2021-03-29T08:00:05.000Z')
  })

  it('should convert a string date to microseconds', () => {
    const timestamp = createTimer().convertStringDateToMicroseconds('2021-03-29 08:00:05.233Z')
    expect(timestamp).toEqual(1617004805233000)
  })

  it('should convert a string date to seconds', () => {
    const timestamp = createTimer().convertStringDateToSeconds('2021-03-29 08:00:05.233Z')
    expect(timestamp).toEqual(1617004805)
  })

  it('should convert microseconds to string date', () => {
    expect(createTimer().convertMicrosecondsToStringDate(1617004805233123)).toEqual('2021-03-29T08:00:05.233123Z')
  })

  it('should convert a string date to milliseconds', () => {
    const timestamp = createTimer().convertStringDateToMilliseconds('Mon Mar 29 2021 12:13:45 GMT+0200')
    expect(timestamp).toEqual(1617012825000)
  })

  it('should convert a string date to date', () => {
    const date = createTimer().convertStringDateToDate('Mon Mar 29 2021 12:13:45 GMT+0200')
    expect(date).toEqual(new Date(1617012825000))
  })

  it('should convert microseconds to date', () => {
    expect(createTimer().convertMicrosecondsToDate(1617004805233123)).toEqual(new Date('2021-03-29T08:00:05.233123Z'))
  })

  it('should convert microseconds to milliseconds', () => {
    expect(createTimer().convertMicrosecondsToMilliseconds(1616164633241312)).toEqual(1616164633241)
  })

  it('should convert microseconds to seconds', () => {
    expect(createTimer().convertMicrosecondsToSeconds(1616164633241312)).toEqual(1616164633)
  })

  it('should format date', () => {
    expect(createTimer().formatDate(new Date('2021-03-29T08:00:05.233123Z'), 'YYYY-MM-DD')).toEqual('2021-03-29')
  })
})
