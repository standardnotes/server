import { Timestamps } from './Timestamps'

describe('Timestamps', () => {
  it('should create a value object', () => {
    const valueOrError = Timestamps.create(new Date(1), new Date(2))

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().createdAt).toEqual(new Date(1))
    expect(valueOrError.getValue().updatedAt).toEqual(new Date(2))
  })

  it('should not create an invalid value object', () => {
    let valueOrError = Timestamps.create(null as unknown as Date, '2' as unknown as Date)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = Timestamps.create(new Date(2), '2' as unknown as Date)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
