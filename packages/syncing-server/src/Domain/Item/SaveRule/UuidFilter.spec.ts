import 'reflect-metadata'

import { ContentType } from '@standardnotes/common'

import { ApiVersion } from '../../Api/ApiVersion'
import { Item } from '../Item'

import { UuidFilter } from './UuidFilter'

describe('UuidFilter', () => {
  const createFilter = () => new UuidFilter()

  it('should filter out items with invalid uuid', async () => {
    const invalidUuids = [
      'c73bcdcc-2669-4bf6-81d3-e4an73fb11fd',
      'c73bcdcc26694bf681d3e4ae73fb11fd',
      'definitely-not-a-uuid',
      '1-2-3',
      'test',
      "(select load_file('\\\\\\\\iugt7mazsk477",
      '/etc/passwd',
      "eval(compile('for x in range(1):\\n i",
    ]

    for (const invalidUuid of invalidUuids) {
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash: {
          uuid: invalidUuid,
          content_type: ContentType.Note,
        },
        existingItem: null,
      })

      expect(result).toEqual({
        passed: false,
        conflict: {
          unsavedItem: {
            uuid: invalidUuid,
            content_type: ContentType.Note,
          },
          type: 'uuid_error',
        },
      })
    }
  })

  it('should leave items with valid uuid', async () => {
    const validUuids = [
      '123e4567-e89b-12d3-a456-426655440000',
      'c73bcdcc-2669-4bf6-81d3-e4ae73fb11fd',
      'C73BCDCC-2669-4Bf6-81d3-E4AE73FB11FD',
    ]

    for (const validUuid of validUuids) {
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash: {
          uuid: validUuid,
          content_type: ContentType.Note,
        },
        existingItem: {} as jest.Mocked<Item>,
      })

      expect(result).toEqual({
        passed: true,
      })
    }
  })
})
