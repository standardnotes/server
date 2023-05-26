import 'reflect-metadata'
import { Item } from '../../Item/Item'
import { ItemRepositoryInterface } from '../../Item/ItemRepositoryInterface'

import { GetGlobalItem } from './GetGlobalItem'

describe('GetGlobalItem', () => {
  let itemRepository: ItemRepositoryInterface

  const createUseCase = () => new GetGlobalItem(itemRepository)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuid = jest.fn().mockReturnValue(null)
  })

  it('should fail if item is not found', async () => {
    expect(
      await createUseCase().execute({
        itemUuid: '2-3-4',
      }),
    ).toEqual({ success: false, message: 'Could not find item with uuid 2-3-4' })
  })

  it('should succeed if item is found', async () => {
    const item = {} as jest.Mocked<Item>
    itemRepository.findByUuid = jest.fn().mockReturnValue(item)

    expect(
      await createUseCase().execute({
        itemUuid: '2-3-4',
      }),
    ).toEqual({ success: true, item })
  })
})
