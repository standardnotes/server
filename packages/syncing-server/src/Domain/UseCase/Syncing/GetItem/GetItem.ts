import { Result, RoleNameCollection, UseCaseInterface } from '@standardnotes/domain-core'

import { GetItemDTO } from './GetItemDTO'
import { Item } from '../../../Item/Item'
import { ItemRepositoryResolverInterface } from '../../../Item/ItemRepositoryResolverInterface'

export class GetItem implements UseCaseInterface<Item> {
  constructor(private itemRepositoryResolver: ItemRepositoryResolverInterface) {}

  async execute(dto: GetItemDTO): Promise<Result<Item>> {
    const roleNamesOrError = RoleNameCollection.create(dto.roleNames)
    if (roleNamesOrError.isFailed()) {
      return Result.fail(roleNamesOrError.getError())
    }
    const roleNames = roleNamesOrError.getValue()

    const itemRepository = this.itemRepositoryResolver.resolve(roleNames)
    const item = await itemRepository.findByUuidAndUserUuid(dto.itemUuid, dto.userUuid)

    if (item === null) {
      return Result.fail(`Could not find item with uuid ${dto.itemUuid}`)
    }

    return Result.ok(item)
  }
}
