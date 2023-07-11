import 'reflect-metadata'

import { ApiVersion } from '../../Api/ApiVersion'
import { Item } from '../Item'

import { ContentTypeFilter } from './ContentTypeFilter'

describe('ContentTypeFilter', () => {
  let existingItem: Item
  const createFilter = () => new ContentTypeFilter()

  it('should filter out items with invalid content type', async () => {
    const invalidContentTypes = [
      '',
      'c73bcdcc26694bf681d3e4ae73fb11fd',
      'definitely-not-a-content-type',
      '1-2-3',
      'test',
      "(select load_file('\\\\\\\\iugt7mazsk477",
      '/etc/passwd',
      "eval(compile('for x in range(1):\\n i",
    ]

    for (const invalidContentType of invalidContentTypes) {
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash: {
          uuid: '123e4567-e89b-12d3-a456-426655440000',
          content_type: invalidContentType,
        },
        existingItem: null,
      })

      expect(result).toEqual({
        passed: false,
        conflict: {
          unsavedItem: {
            uuid: '123e4567-e89b-12d3-a456-426655440000',
            content_type: invalidContentType,
          },
          type: 'content_type_error',
        },
      })
    }
  })

  it('should leave items with valid content type', async () => {
    const validContentTypes = ['Note', 'SN|ItemsKey', 'SN|Component', 'SN|Editor', 'SN|ExtensionRepo', 'Tag']

    for (const validContentType of validContentTypes) {
      const result = await createFilter().check({
        userUuid: '1-2-3',
        apiVersion: ApiVersion.v20200115,
        itemHash: {
          uuid: '123e4567-e89b-12d3-a456-426655440000',
          content_type: validContentType,
        },
        existingItem,
      })

      expect(result).toEqual({
        passed: true,
      })
    }
  })
})
