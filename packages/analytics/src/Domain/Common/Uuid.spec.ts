import { Uuid } from './Uuid'

describe('Uuid', () => {
  it('should create a value object', () => {
    const valueOrError = Uuid.create('1-2-3')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('1-2-3')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Uuid.create('')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
