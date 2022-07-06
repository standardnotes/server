import { Period } from './Period'
import { PeriodKeyGenerator } from './PeriodKeyGenerator'

describe('PeriodKeyGenerator', () => {
  const createGenerator = () => new PeriodKeyGenerator()

  beforeEach(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(1653395155000)
  })

  afterEach(() => {
    jest.useRealTimers()
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
})
