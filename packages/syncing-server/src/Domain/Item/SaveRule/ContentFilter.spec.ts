import 'reflect-metadata'

import { ApiVersion } from '../../Api/ApiVersion'
import { Item } from '../Item'

import { ContentFilter } from './ContentFilter'
import { ContentType } from '@standardnotes/domain-core'
import { ItemHash } from '../ItemHash'

describe('ContentFilter', () => {
  let existingItem: Item
  const createFilter = () => new ContentFilter()

  it('should filter out items with invalid content', async () => {
    const invalidContents = [[], { foo: 'bar' }, [{ foo: 'bar' }], 123, new Date(1)]

    for (const invalidContent of invalidContents) {
      const itemHash = ItemHash.create({
        uuid: '123e4567-e89b-12d3-a456-426655440000',
        content: invalidContent as unknown as string,
        content_type: ContentType.TYPES.Note,
        user_uuid: '1-2-3',
        key_system_identifier: null,
        shared_vault_uuid: null,
      }).getValue()
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash,
        existingItem: null,
      })

      expect(result).toEqual({
        passed: false,
        conflict: {
          unsavedItem: itemHash,
          type: 'content_error',
        },
      })
    }
  })

  it('should leave items with valid content', async () => {
    const validContents = ['string', null, undefined]

    for (const validContent of validContents) {
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash: ItemHash.create({
          uuid: '123e4567-e89b-12d3-a456-426655440000',
          content: validContent as unknown as string,
          content_type: ContentType.TYPES.Note,
          user_uuid: '1-2-3',
          key_system_identifier: null,
          shared_vault_uuid: null,
        }).getValue(),
        existingItem,
      })

      expect(result).toEqual({
        passed: true,
      })
    }
  })
})
