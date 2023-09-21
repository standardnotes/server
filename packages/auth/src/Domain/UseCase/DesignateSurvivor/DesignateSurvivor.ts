import { TimerInterface } from '@standardnotes/time'
import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'

import { DesignateSurvivorDTO } from './DesignateSurvivorDTO'
import { SharedVaultUserRepositoryInterface } from '../../SharedVault/SharedVaultUserRepositoryInterface'

export class DesignateSurvivor implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: DesignateSurvivorDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const existingSurvivor =
      await this.sharedVaultUserRepository.findDesignatedSurvivorBySharedVaultUuid(sharedVaultUuid)

    if (existingSurvivor) {
      if (existingSurvivor.props.timestamps.updatedAt > dto.timestamp) {
        return Result.fail(
          'Cannot designate survivor to a previous version of the shared vault. Most probably a race condition.',
        )
      }
      if (existingSurvivor.props.userUuid.value === userUuid.value) {
        return Result.ok()
      }

      existingSurvivor.props.isDesignatedSurvivor = false
      existingSurvivor.props.timestamps = Timestamps.create(
        existingSurvivor.props.timestamps.createdAt,
        this.timer.getTimestampInMicroseconds(),
      ).getValue()

      await this.sharedVaultUserRepository.save(existingSurvivor)
    }

    const toBeDesignatedAsASurvivor = await this.sharedVaultUserRepository.findByUserUuidAndSharedVaultUuid({
      userUuid,
      sharedVaultUuid,
    })
    if (!toBeDesignatedAsASurvivor) {
      return Result.fail('User is not a member of the shared vault')
    }

    toBeDesignatedAsASurvivor.props.isDesignatedSurvivor = true
    toBeDesignatedAsASurvivor.props.timestamps = Timestamps.create(
      toBeDesignatedAsASurvivor.props.timestamps.createdAt,
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    await this.sharedVaultUserRepository.save(toBeDesignatedAsASurvivor)

    return Result.ok()
  }
}
