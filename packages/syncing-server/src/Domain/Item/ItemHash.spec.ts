import { ContentType } from '@standardnotes/domain-core'
import { ItemHash } from './ItemHash'

describe('ItemHash', () => {
  it('should create a value object', () => {
    const valueOrError = ItemHash.create({
      uuid: '00000000-0000-0000-0000-000000000000',
      content_type: ContentType.TYPES.Note,
      user_uuid: '00000000-0000-0000-0000-000000000000',
      content: 'foobar',
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
      created_at_timestamp: 123,
      updated_at_timestamp: 123,
      key_system_identifier: null,
      shared_vault_uuid: null,
    })

    expect(valueOrError.isFailed()).toBeFalsy()
  })

  it('should return error if shared vault uuid is not valid', () => {
    const valueOrError = ItemHash.create({
      uuid: '00000000-0000-0000-0000-000000000000',
      content_type: ContentType.TYPES.Note,
      user_uuid: '00000000-0000-0000-0000-000000000000',
      content: 'foobar',
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
      created_at_timestamp: 123,
      updated_at_timestamp: 123,
      key_system_identifier: null,
      shared_vault_uuid: 'invalid',
    })

    expect(valueOrError.isFailed()).toBeTruthy()
  })
})
