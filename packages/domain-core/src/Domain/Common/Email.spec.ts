import { Email } from './Email'

describe('Email', () => {
  it('should create a value object', () => {
    const valueOrError = Email.create('test@test.te')

    expect(valueOrError.isFailed()).toBeFalsy()
    expect(valueOrError.getValue().value).toEqual('test@test.te')
  })

  it('should not create an invalid value object', () => {
    const valueOrError = Email.create('foobar')

    expect(valueOrError.isFailed()).toBeTruthy()
  })

  it('should not create an invalid type object', () => {
    const valueOrError = Email.create(undefined as unknown as string)

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
