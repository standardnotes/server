import { Timestamps } from './Timestamps'

describe('Timestamps', () => {
  it('should create a value object', () => {
    const valueOrError = Timestamps.create(123, 234)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().createdAt).toEqual(123)
    expect(valueOrError.getValue().updatedAt).toEqual(234)
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Timestamps.create('' as unknown as number, 123)

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Timestamps.create(123, '' as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
