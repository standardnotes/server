import { ContentType, Dates, UniqueEntityId, Uuid } from '@standardnotes/domain-core'

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
      dates: Dates.create(new Date(1), new Date(2)).getValue(),
    })

    expect(entityOrError.isFailed()).toBeFalsy()
    expect(entityOrError.getValue().id).not.toBeNull()
  })

  it('should tell if a revision is identical to another revision', () => {
    const entity1 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const entity2 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    expect(entity1.isIdenticalTo(entity2)).toBeTruthy()
  })

  it('should tell if a revision is not identical to another revision', () => {
    const entity1 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const entity2 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test2',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    expect(entity1.isIdenticalTo(entity2)).toBeFalsy()
  })

  it('should tell if a revision is not identical to another revision id ids do not match', () => {
    const entity1 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000000'),
    ).getValue()

    const entity2 = Revision.create(
      {
        itemUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        userUuid: Uuid.create('84c0f8e8-544a-4c7e-9adf-26209303bc1d').getValue(),
        content: 'test',
        contentType: ContentType.create('Note').getValue(),
        itemsKeyId: 'test',
        encItemKey: 'test',
        authHash: 'test',
        creationDate: new Date(1),
        dates: Dates.create(new Date(1), new Date(2)).getValue(),
      },
      new UniqueEntityId('00000000-0000-0000-0000-000000000001'),
    ).getValue()

    expect(entity1.isIdenticalTo(entity2)).toBeFalsy()
  })
})
