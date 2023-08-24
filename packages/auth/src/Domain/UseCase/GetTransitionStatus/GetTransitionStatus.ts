import { Result, RoleName, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { GetTransitionStatusDTO } from './GetTransitionStatusDTO'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { TransitionStatusRepositoryInterface } from '../../Transition/TransitionStatusRepositoryInterface'

export class GetTransitionStatus implements UseCaseInterface<'TO-DO' | 'STARTED' | 'FINISHED' | 'FAILED'> {
  constructor(
    private transitionStatusRepository: TransitionStatusRepositoryInterface,
    private userRepository: UserRepositoryInterface,
  ) {}

  async execute(dto: GetTransitionStatusDTO): Promise<Result<'TO-DO' | 'STARTED' | 'FINISHED' | 'FAILED'>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const user = await this.userRepository.findOneByUuid(userUuid)
    if (user === null) {
      return Result.fail('User not found.')
    }

    const roles = await user.roles
    for (const role of roles) {
      if (role.name === RoleName.NAMES.TransitionUser) {
        return Result.ok('FINISHED')
      }
    }

    const transitionStatus = await this.transitionStatusRepository.getStatus(userUuid.value)
    if (transitionStatus === null) {
      return Result.ok('TO-DO')
    }

    return Result.ok(transitionStatus)
  }
}
