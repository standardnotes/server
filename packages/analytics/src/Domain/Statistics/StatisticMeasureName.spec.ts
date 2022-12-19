import { StatisticMeasureName } from './StatisticMeasureName'

describe('StatisticMeasureName', () => {
  it('should create a value object', () => {
    const valueOrError = StatisticMeasureName.create('pro-subscription-initial-monthly-payments-income')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('pro-subscription-initial-monthly-payments-income')
  })

  it('should not create an invalid value object', () => {
    for (const value of ['', undefined, null, 0, 'foobar']) {
      const valueOrError = StatisticMeasureName.create(value as string)

      expect(valueOrError.isFailed()).toBeTruthy()
    }
  })
})
