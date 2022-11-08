import { MonthlyRevenue } from './MonthlyRevenue'

describe('MonthlyRevenue', () => {
  it('should create a value object', () => {
    const valueOrError = MonthlyRevenue.create(123)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual(123)
  })

  it('should not create an invalid value object', () => {
    const valueOrError = MonthlyRevenue.create(-3)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
