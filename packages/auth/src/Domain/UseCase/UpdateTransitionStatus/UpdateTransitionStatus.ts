import { Result, RoleName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { UpdateTransitionStatusDTO } from './UpdateTransitionStatusDTO'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'
import { Logger } from 'winston'

export class UpdateTransitionStatus implements UseCaseInterface<void> {
  constructor(
    private transitionStatusRepository: TransitionStatusRepositoryInterface,
    private roleService: RoleServiceInterface,
    private logger: Logger,
  ) {}

  async execute(dto: UpdateTransitionStatusDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (dto.status !== 'FINISHED') {
      await this.transitionStatusRepository.updateStatus(dto.userUuid, dto.transitionType, dto.status)

      return Result.ok()
    }

    await this.transitionStatusRepository.removeStatus(dto.userUuid, dto.transitionType)

    if (dto.transitionType === 'items') {
      await this.roleService.addRoleToUser(userUuid, RoleName.create(RoleName.NAMES.TransitionUser).getValue())
    }

    const itemStatuses = await this.transitionStatusRepository.getStatuses('items')
    const itemsStartedStatusesCount = itemStatuses.filter((status) => status.status === 'STARTED').length
    const itemsInProgressStatusesCount = itemStatuses.filter((status) => status.status === 'IN_PROGRESS').length
    const itemsFailedStatusesCount = itemStatuses.filter((status) => status.status === 'FAILED').length

    this.logger.info(
      `[TRANSITION ${dto.transitionTimestamp}] Items transition statuses: ${itemsStartedStatusesCount} started, ${itemsInProgressStatusesCount} in progress, ${itemsFailedStatusesCount} failed`,
    )

    const revisionStatuses = await this.transitionStatusRepository.getStatuses('revisions')
    const revisionsStartedStatusesCount = revisionStatuses.filter((status) => status.status === 'STARTED').length
    const revisionsInProgressStatusesCount = revisionStatuses.filter((status) => status.status === 'IN_PROGRESS').length
    const revisionsFailedStatusesCount = revisionStatuses.filter((status) => status.status === 'FAILED').length

    this.logger.info(
      `[TRANSITION ${dto.transitionTimestamp}] Revisions transition statuses: ${revisionsStartedStatusesCount} started, ${revisionsInProgressStatusesCount} in progress, ${revisionsFailedStatusesCount} failed`,
    )

    return Result.ok()
  }
}
