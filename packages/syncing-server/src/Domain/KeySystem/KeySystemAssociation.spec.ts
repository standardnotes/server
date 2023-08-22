import { KeySystemAssociation } from './KeySystemAssociation'

describe('KeySystemAssociation', () => {
  it('should create a value object', () => {
    const entityOrError = KeySystemAssociation.create('00000000-0000-0000-0000-000000000000')

    expect(entityOrError.isFailed()).toBeFalsy()
  })

  it('should fail to create a value object with an empty key system identifier', () => {
    const entityOrError = KeySystemAssociation.create('')

    expect(entityOrError.isFailed()).toBeTruthy()
  })
})
