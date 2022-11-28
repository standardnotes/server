import { Timestamps, Uuid } from '@standardnotes/domain-core'
import { ContentType } from './ContentType'
import { Revision } from './Revision'

describe('Revision', () => {
  it('should create an entity', () => {
    const entityOrError = Revision.create({
      itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
      userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
      content: 'test',
      contentType: ContentType.create('Note').getValue(),
      itemsKeyId: 'test',
      encItemKey: 'test',
      authHash: 'test',
      creationDate: new Date(1),
      timestamps: Timestamps.create(new Date(1), new Date(2)).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })
})
