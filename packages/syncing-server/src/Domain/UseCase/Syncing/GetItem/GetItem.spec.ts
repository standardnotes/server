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
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
    })
    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not find item with uuid 2-3-4')
  })

  it('should succeed if item is found', async () => {
    const item = {} as jest.Mocked<Item>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
    })

    expect(result.getValue()).toEqual(item)
  })
})
