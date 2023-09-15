import { Result, RoleName, TransitionStatus, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
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

    const currentStatus = await this.transitionStatusRepository.getStatus(dto.userUuid, dto.transitionType)
    if (
      [TransitionStatus.STATUSES.Verified, TransitionStatus.STATUSES.Failed].includes(currentStatus?.value as string)
    ) {
      this.logger.info(`User ${dto.userUuid} transition already finished.`)

      return Result.ok()
    }

    const transitionStatus = TransitionStatus.create(dto.status).getValue()

    await this.transitionStatusRepository.updateStatus(dto.userUuid, dto.transitionType, transitionStatus)

    if (dto.transitionType === 'items' && transitionStatus.value === TransitionStatus.STATUSES.Verified) {
      await this.roleService.addRoleToUser(userUuid, RoleName.create(RoleName.NAMES.TransitionUser).getValue())
    }

    return Result.ok()
  }
}
