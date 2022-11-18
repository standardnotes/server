import { Uuid } from './Uuid'

describe('Uuid', () => {
  it('should create a value object', () => {
    const valueOrError = Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('84c0f8e8-544a-4c7e-9adf-26209303bc1d')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Uuid.create('1-2-3')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
