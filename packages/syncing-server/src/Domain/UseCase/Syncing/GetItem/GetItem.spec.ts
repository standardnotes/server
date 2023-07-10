import 'reflect-metadata'
import { Item } from '../../../Item/Item'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

import { GetItem } from './GetItem'

describe('GetItem', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new GetItem(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)
  })

  it('should fail if item is not found', async () => {
    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        itemUuid: '2-3-4',
      }),
    ).toEqual({ success: false, message: 'Could not find item with uuid 2-3-4' })
  })

  it('should succeed if item is found', async () => {
    const item = {} as jest.Mocked<Item>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    expect(
      await createUseCase().execute({
        userUuid: '1-2-3',
        itemUuid: '2-3-4',
      }),
    ).toEqual({ success: true, item })
  })
})
