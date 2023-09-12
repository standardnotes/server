import { Result, RoleName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'
import { UpdateTransitionStatusDTO } from './UpdateTransitionStatusDTO'
import { RoleServiceInterface } from '../../Role/RoleServiceInterface'

export class UpdateTransitionStatus implements UseCaseInterface<void> {
  constructor(
    private transitionStatusRepository: TransitionStatusRepositoryInterface,
    private roleService: RoleServiceInterface,
  ) {}

  async execute(dto: UpdateTransitionStatusDTO): Promise<Result<void>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    if (dto.status === 'FINISHED') {
      await this.transitionStatusRepository.removeStatus(dto.userUuid, dto.transitionType)

      if (dto.transitionType === 'items') {
        await this.roleService.addRoleToUser(userUuid, RoleName.create(RoleName.NAMES.TransitionUser).getValue())
      }

      return Result.ok()
    }

    await this.transitionStatusRepository.updateStatus(dto.userUuid, dto.transitionType, dto.status)

    return Result.ok()
  }
}
