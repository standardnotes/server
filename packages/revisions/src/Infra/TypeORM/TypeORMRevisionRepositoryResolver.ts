import { RoleName, RoleNameCollection } from '@standardnotes/domain-core'

import { RevisionRepositoryResolverInterface } from '../../Domain/Revision/RevisionRepositoryResolverInterface'
import { RevisionRepositoryInterface } from '../../Domain/Revision/RevisionRepositoryInterface'

export class TypeORMRevisionRepositoryResolver implements RevisionRepositoryResolverInterface {
  constructor(
    private sqlRevisionRepository: RevisionRepositoryInterface,
    private mongoDbRevisionRepository: RevisionRepositoryInterface | null,
  ) {}

  resolve(roleNames: RoleNameCollection): RevisionRepositoryInterface {
    if (!this.mongoDbRevisionRepository) {
      return this.sqlRevisionRepository
    }

    const transitionRoleName = RoleName.create(RoleName.NAMES.TransitionUser).getValue()

    if (roleNames.includes(transitionRoleName)) {
      return this.mongoDbRevisionRepository
    }

    return this.sqlRevisionRepository
  }
}
