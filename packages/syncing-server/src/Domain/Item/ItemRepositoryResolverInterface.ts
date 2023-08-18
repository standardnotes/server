import { RoleNameCollection } from '@standardnotes/domain-core'

import { ItemRepositoryInterface } from './ItemRepositoryInterface'

export interface ItemRepositoryResolverInterface {
  resolve(roleNames: RoleNameCollection): ItemRepositoryInterface
}
