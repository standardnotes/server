import 'reflect-metadata'
import { Item } from '../../../Item/Item'
import { ItemRepositoryInterface } from '../../../Item/ItemRepositoryInterface'

import { GetItem } from './GetItem'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'
import { RoleName } from '@standardnotes/domain-core'

describe('GetItem', () => {
  let itemRepository: ItemRepositoryInterface
  let itemRepositoryResolver: ItemRepositoryResolverInterface

  const createUseCase = () => new GetItem(itemRepositoryResolver)

  beforeEach(() => {
    itemRepository = {} as jest.Mocked<ItemRepositoryInterface>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(null)

    itemRepositoryResolver = {} as jest.Mocked<ItemRepositoryResolverInterface>
    itemRepositoryResolver.resolve = jest.fn().mockReturnValue(itemRepository)
  })

  it('should fail if item is not found', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
      roleNames: [RoleName.NAMES.CoreUser],
    })
    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Could not find item with uuid 2-3-4')
  })

  it('should fail if the role names are invalid', async () => {
    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
      roleNames: ['invalid-role-name'],
    })
    expect(result.isFailed()).toBeTruthy()
    expect(result.getError()).toEqual('Invalid role name: invalid-role-name')
  })

  it('should succeed if item is found', async () => {
    const item = {} as jest.Mocked<Item>
    itemRepository.findByUuidAndUserUuid = jest.fn().mockReturnValue(item)

    const result = await createUseCase().execute({
      userUuid: '1-2-3',
      itemUuid: '2-3-4',
      roleNames: [RoleName.NAMES.CoreUser],
    })

    expect(result.getValue()).toEqual(item)
  })
})
