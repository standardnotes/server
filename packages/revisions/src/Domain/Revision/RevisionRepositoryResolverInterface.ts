import { RoleNameCollection } from '@standardnotes/domain-core'

import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'

export interface RevisionRepositoryResolverInterface {
  resolve(roleNames: RoleNameCollection): RevisionRepositoryInterface
}
