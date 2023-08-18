import { RoleName, RoleNameCollection } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from '../../Domain/Item/ItemRepositoryInterface'
import { ItemRepositoryResolverInterface } from '../../Domain/Item/ItemRepositoryResolverInterface'

export class TypeORMItemRepositoryResolver implements ItemRepositoryResolverInterface {
  constructor(
    private mysqlItemRepository: ItemRepositoryInterface,
    private mongoDbItemRepository: ItemRepositoryInterface | null,
  ) {}

  resolve(roleNames: RoleNameCollection): ItemRepositoryInterface {
    if (!this.mongoDbItemRepository) {
      return this.mysqlItemRepository
    }

    const transitionRoleName = RoleName.create(RoleName.NAMES.TransitionUser).getValue()

    if (roleNames.includes(transitionRoleName)) {
      return this.mongoDbItemRepository
    }

    return this.mysqlItemRepository
  }
}
