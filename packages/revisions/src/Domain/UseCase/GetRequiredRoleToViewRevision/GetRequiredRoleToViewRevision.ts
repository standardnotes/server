import { Result, RoleName, SyncUseCaseInterface } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { GetRequiredRoleToViewRevisionDTO } from './GetRequiredRoleToViewRevisionDTO'

export class GetRequiredRoleToViewRevision implements SyncUseCaseInterface<string> {
  constructor(private timer: TimerInterface) {}

  execute(dto: GetRequiredRoleToViewRevisionDTO): Result<string> {
    const revisionCreatedNDaysAgo = this.timer.dateWasNDaysAgo(dto.createdAt)

    if (revisionCreatedNDaysAgo > 30 && revisionCreatedNDaysAgo < 365) {
      return Result.ok(RoleName.NAMES.PlusUser)
    }

    if (revisionCreatedNDaysAgo > 365) {
      return Result.ok(RoleName.NAMES.ProUser)
    }

    return Result.ok(RoleName.NAMES.CoreUser)
  }
}
