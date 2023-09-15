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

    this.logger.info(`Received transition status updated event to ${dto.status} for user ${dto.userUuid}`)

    await this.transitionStatusRepository.updateStatus(dto.userUuid, dto.transitionType, dto.status)

    if (dto.transitionType === 'items' && dto.status === 'VERIFIED') {
      await this.roleService.addRoleToUser(userUuid, RoleName.create(RoleName.NAMES.TransitionUser).getValue())
    }

    return Result.ok()
  }
}
