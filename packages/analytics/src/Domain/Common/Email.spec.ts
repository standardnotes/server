import { Email } from './Email'

describe('Email', () => {
  it('should create a value object', () => {
    const valueOrError = Email.create('test@test.te')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('test@test.te')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Email.create('')

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
