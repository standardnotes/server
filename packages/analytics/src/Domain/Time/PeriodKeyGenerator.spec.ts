import { Period } from './Period'
import { PeriodKeyGenerator } from './PeriodKeyGenerator'

describe('PeriodKeyGenerator', () => {
  const createGenerator = () => new PeriodKeyGenerator()
  const months = [
    Period.JanuaryThisYear,
    Period.FebruaryThisYear,
    Period.MarchThisYear,
    Period.AprilThisYear,
    Period.MayThisYear,
    Period.JuneThisYear,
    Period.JulyThisYear,
    Period.AugustThisYear,
    Period.SeptemberThisYear,
    Period.OctoberThisYear,
    Period.NovemberThisYear,
    Period.DecemberThisYear,
  ]

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(1653395155000)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should generate period keys for last 30 days', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Last30Days)).toEqual([
      '2022-4-24',
      '2022-4-25',
      '2022-4-26',
      '2022-4-27',
      '2022-4-28',
      '2022-4-29',
      '2022-4-30',
      '2022-5-1',
      '2022-5-2',
      '2022-5-3',
      '2022-5-4',
      '2022-5-5',
      '2022-5-6',
      '2022-5-7',
      '2022-5-8',
      '2022-5-9',
      '2022-5-10',
      '2022-5-11',
      '2022-5-12',
      '2022-5-13',
      '2022-5-14',
      '2022-5-15',
      '2022-5-16',
      '2022-5-17',
      '2022-5-18',
      '2022-5-19',
      '2022-5-20',
      '2022-5-21',
      '2022-5-22',
      '2022-5-23',
    ])
  })

  it('should generate period keys for last 30 days including Today', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Last30DaysIncludingToday)).toEqual([
      '2022-4-25',
      '2022-4-26',
      '2022-4-27',
      '2022-4-28',
      '2022-4-29',
      '2022-4-30',
      '2022-5-1',
      '2022-5-2',
      '2022-5-3',
      '2022-5-4',
      '2022-5-5',
      '2022-5-6',
      '2022-5-7',
      '2022-5-8',
      '2022-5-9',
      '2022-5-10',
      '2022-5-11',
      '2022-5-12',
      '2022-5-13',
      '2022-5-14',
      '2022-5-15',
      '2022-5-16',
      '2022-5-17',
      '2022-5-18',
      '2022-5-19',
      '2022-5-20',
      '2022-5-21',
      '2022-5-22',
      '2022-5-23',
      '2022-5-24',
    ])
  })

  it('should generate period keys for this year', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.ThisYear)).toEqual([
      '2022-1',
      '2022-2',
      '2022-3',
      '2022-4',
      '2022-5',
      '2022-6',
      '2022-7',
      '2022-8',
      '2022-9',
      '2022-10',
      '2022-11',
      '2022-12',
    ])
  })

  it('should generate period keys for last 7 days', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Last7Days)).toEqual([
      '2022-5-17',
      '2022-5-18',
      '2022-5-19',
      '2022-5-20',
      '2022-5-21',
      '2022-5-22',
      '2022-5-23',
    ])
  })

  it('should generate period keys for this month', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.ThisMonth)).toEqual([
      '2022-5-1',
      '2022-5-2',
      '2022-5-3',
      '2022-5-4',
      '2022-5-5',
      '2022-5-6',
      '2022-5-7',
      '2022-5-8',
      '2022-5-9',
      '2022-5-10',
      '2022-5-11',
      '2022-5-12',
      '2022-5-13',
      '2022-5-14',
      '2022-5-15',
      '2022-5-16',
      '2022-5-17',
      '2022-5-18',
      '2022-5-19',
      '2022-5-20',
      '2022-5-21',
      '2022-5-22',
      '2022-5-23',
      '2022-5-24',
      '2022-5-25',
      '2022-5-26',
      '2022-5-27',
      '2022-5-28',
      '2022-5-29',
      '2022-5-30',
      '2022-5-31',
    ])
  })

  it('should generate period keys for specific month', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.FebruaryThisYear)).toEqual([
      '2022-2-1',
      '2022-2-2',
      '2022-2-3',
      '2022-2-4',
      '2022-2-5',
      '2022-2-6',
      '2022-2-7',
      '2022-2-8',
      '2022-2-9',
      '2022-2-10',
      '2022-2-11',
      '2022-2-12',
      '2022-2-13',
      '2022-2-14',
      '2022-2-15',
      '2022-2-16',
      '2022-2-17',
      '2022-2-18',
      '2022-2-19',
      '2022-2-20',
      '2022-2-21',
      '2022-2-22',
      '2022-2-23',
      '2022-2-24',
      '2022-2-25',
      '2022-2-26',
      '2022-2-27',
      '2022-2-28',
    ])
  })

  it('should generate period keys for specific months', () => {
    for (const month of months) {
      expect(createGenerator().getDiscretePeriodKeys(month).length >= 28).toBeTruthy()
    }
  })

  it('should generate period keys for Q1', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Q1ThisYear)).toEqual(['2022-1', '2022-2', '2022-3'])
  })

  it('should generate period keys for Q2', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Q2ThisYear)).toEqual(['2022-4', '2022-5', '2022-6'])
  })

  it('should generate period keys for Q3', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Q3ThisYear)).toEqual(['2022-7', '2022-8', '2022-9'])
  })

  it('should generate period keys for Q4', () => {
    expect(createGenerator().getDiscretePeriodKeys(Period.Q4ThisYear)).toEqual(['2022-10', '2022-11', '2022-12'])
  })

  it('should generate a period key for this year', () => {
    expect(createGenerator().getPeriodKey(Period.ThisYear)).toEqual('2022')
  })

  it('should generate a period key for today', () => {
    expect(createGenerator().getPeriodKey(Period.Today)).toEqual('2022-5-24')
  })

  it('should generate a period key for yesterday', () => {
    expect(createGenerator().getPeriodKey(Period.Yesterday)).toEqual('2022-5-23')
  })

  it('should generate a period key for the day before yesterday', () => {
    expect(createGenerator().getPeriodKey(Period.DayBeforeYesterday)).toEqual('2022-5-22')
  })

  it('should generate a period key for this week', () => {
    expect(createGenerator().getPeriodKey(Period.ThisWeek)).toEqual('2022-week-21')
  })

  it('should generate a period key for last week', () => {
    expect(createGenerator().getPeriodKey(Period.LastWeek)).toEqual('2022-week-20')
  })

  it('should generate a period key for the week before last week', () => {
    expect(createGenerator().getPeriodKey(Period.WeekBeforeLastWeek)).toEqual('2022-week-19')
  })

  it('should generate a period key for this month', () => {
    expect(createGenerator().getPeriodKey(Period.ThisMonth)).toEqual('2022-5')
  })

  it('should generate a period key for each month', () => {
    for (let i = 0; i < months.length; i++) {
      expect(createGenerator().getPeriodKey(months[i])).toEqual(`2022-${i + 1}`)
    }
  })

  it('should generate a period key for last month', () => {
    expect(createGenerator().getPeriodKey(Period.LastMonth)).toEqual('2022-4')
  })

  it('should throw error on unsupported period', () => {
    let error = null
    try {
      createGenerator().getPeriodKey(42 as Period)
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })

  it('should throw error on unsupported period for discrete generation', () => {
    let error = null
    try {
      createGenerator().getDiscretePeriodKeys(Period.Today)
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).not.toBeNull()
  })

  it('should convert period key to period', () => {
    expect(createGenerator().convertPeriodKeyToPeriod('2022-1')).toEqual(Period.JanuaryThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-2')).toEqual(Period.FebruaryThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-3')).toEqual(Period.MarchThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-4')).toEqual(Period.AprilThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-5')).toEqual(Period.MayThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-6')).toEqual(Period.JuneThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-7')).toEqual(Period.JulyThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-8')).toEqual(Period.AugustThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-9')).toEqual(Period.SeptemberThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-10')).toEqual(Period.OctoberThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-11')).toEqual(Period.NovemberThisYear)
    expect(createGenerator().convertPeriodKeyToPeriod('2022-12')).toEqual(Period.DecemberThisYear)
  })
})
