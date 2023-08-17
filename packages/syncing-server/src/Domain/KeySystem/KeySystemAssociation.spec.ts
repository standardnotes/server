import { KeySystemAssociation } from './KeySystemAssociation'

describe('KeySystemAssociation', () => {
  it('should create an entity', () => {
    const entityOrError = KeySystemAssociation.create({
      keySystemIdentifier: '00000000-0000-0000-0000-000000000000',
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
