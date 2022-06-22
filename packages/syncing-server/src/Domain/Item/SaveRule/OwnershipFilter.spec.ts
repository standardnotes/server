import 'reflect-metadata'

import { ContentType } from '@standardnotes/common'

import { ApiVersion } from '../../Api/ApiVersion'
import { Item } from '../Item'

import { OwnershipFilter } from './OwnershipFilter'

describe('OwnershipFilter', () => {
  let existingItem: Item
  const createFilter = () => new OwnershipFilter()

  beforeEach(() => {
    existingItem = {} as jest.Mocked<Item>
    existingItem.userUuid = '2-3-4'
  })

  it('should filter out items belonging to a different user', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Note,
      },
      existingItem,
    })

    expect(result).toEqual({
      passed: false,
      conflict: {
        unsavedItem: {
          uuid: '2-3-4',
          content_type: ContentType.Note,
        },
        type: 'uuid_conflict',
      },
    })
  })

  it('should leave items belonging to the same user', async () => {
    existingItem.userUuid = '1-2-3'

    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Note,
      },
      existingItem,
    })

    expect(result).toEqual({
      passed: true,
    })
  })

  it('should leave non existing items', async () => {
    const result = await createFilter().check({
      userUuid: '1-2-3',
      apiVersion: ApiVersion.v20200115,
      itemHash: {
        uuid: '2-3-4',
        content_type: ContentType.Note,
      },
      existingItem: null,
    })

    expect(result).toEqual({
      passed: true,
    })
  })
})
