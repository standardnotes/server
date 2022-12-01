import { Timestamps } from './Timestamps'

describe('Timestamps', () => {
  it('should create a value object', () => {
    const valueOrError = Timestamps.create(1, 2)

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().createdAt).toEqual(1)
    expect(valueOrError.getValue().updatedAt).toEqual(2)
  })

  it('should not create an invalid value object', () => {
    let valueOrError = Timestamps.create(null as unknown as number, 'b' as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()

    valueOrError = Timestamps.create(2, 'a' as unknown as number)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
