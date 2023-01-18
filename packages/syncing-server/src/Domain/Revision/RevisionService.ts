import { inject, injectable } from 'inversify'
import { RoleName } from '@standardnotes/common'
import { TimerInterface } from '@standardnotes/time'

import TYPES from '../../Bootstrap/Types'
import { Revision } from './Revision'
import { RevisionRepositoryInterface } from './RevisionRepositoryInterface'
import { RevisionServiceInterface } from './RevisionServiceInterface'
import { ItemRepositoryInterface } from '../Item/ItemRepositoryInterface'
import { RevisionMetadata } from './RevisionMetadata'

@injectable()
export class RevisionService implements RevisionServiceInterface {
  constructor(
    @inject(TYPES.RevisionRepository) private revisionRepository: RevisionRepositoryInterface,
    @inject(TYPES.ItemRepository) private itemRepository: ItemRepositoryInterface,
    @inject(TYPES.Timer) private timer: TimerInterface,
  ) {}

  async removeRevision(dto: { userUuid: string; itemUuid: string; revisionUuid: string }): Promise<boolean> {
    const userItem = await this.itemRepository.findByUuid(dto.itemUuid)
    if (userItem === null || userItem.userUuid !== dto.userUuid) {
      return false
    }

    await this.revisionRepository.removeByUuid(dto.itemUuid, dto.revisionUuid)

    return true
  }

  async getRevisionsMetadata(userUuid: string, itemUuid: string): Promise<RevisionMetadata[]> {
    const userItem = await this.itemRepository.findByUuid(itemUuid)
    if (userItem === null || userItem.userUuid !== userUuid) {
      return []
    }

    return this.revisionRepository.findMetadataByItemId(itemUuid)
  }

  async getRevision(dto: {
    userUuid: string
    userRoles: RoleName[]
    itemUuid: string
    revisionUuid: string
  }): Promise<Revision | null> {
    const userItem = await this.itemRepository.findByUuid(dto.itemUuid)
    if (userItem === null || userItem.userUuid !== dto.userUuid) {
      return null
    }

    const revision = await this.revisionRepository.findOneById(dto.itemUuid, dto.revisionUuid)

    if (revision !== null && !this.userHasEnoughPermissionsToSeeRevision(dto.userRoles, revision.createdAt)) {
      return null
    }

    return revision
  }

  calculateRequiredRoleBasedOnRevisionDate(createdAt: Date): RoleName {
    const revisionCreatedNDaysAgo = this.timer.dateWasNDaysAgo(createdAt)

    if (revisionCreatedNDaysAgo > 30 && revisionCreatedNDaysAgo < 365) {
      return RoleName.PlusUser
    }

    if (revisionCreatedNDaysAgo > 365) {
      return RoleName.ProUser
    }

    return RoleName.CoreUser
  }

  private userHasEnoughPermissionsToSeeRevision(userRoles: RoleName[], revisionCreatedAt: Date): boolean {
    const roleRequired = this.calculateRequiredRoleBasedOnRevisionDate(revisionCreatedAt)

    switch (roleRequired) {
      case RoleName.PlusUser:
        return userRoles.filter((userRole) => [RoleName.PlusUser, RoleName.ProUser].includes(userRole)).length > 0
      case RoleName.ProUser:
        return userRoles.includes(RoleName.ProUser)
      default:
        return true
    }
  }
}
