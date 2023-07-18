import { Timestamps, Uuid } from '@standardnotes/domain-core'

import { KeySystemAssociation } from './KeySystemAssociation'

describe('KeySystemAssociation', () => {
  it('should create an entity', () => {
    const entityOrError = KeySystemAssociation.create({
      timestamps: Timestamps.create(123456789, 123456789).getValue(),
      itemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
      keySystemUuid: Uuid.create('00000000-0000-0000-0000-000000000000').getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
