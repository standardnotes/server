import { Result, Timestamps, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { CreateSharedVaultResult } from './CreateSharedVaultResult'
import { CreateSharedVaultDTO } from './CreateSharedVaultDTO'
import { TimerInterface } from '@standardnotes/time'
import { SharedVaultRepositoryInterface } from '../../../SharedVault/SharedVaultRepositoryInterface'
import { AddUserToSharedVault } from '../AddUserToSharedVault/AddUserToSharedVault'
import { SharedVault } from '../../../SharedVault/SharedVault'

export class CreateSharedVault implements UseCaseInterface<CreateSharedVaultResult> {
  private readonly FILE_UPLOAD_BYTES_LIMIT = 1_000_000

  constructor(
    private addUserToSharedVault: AddUserToSharedVault,
    private sharedVaultRepository: SharedVaultRepositoryInterface,
    private timer: TimerInterface,
  ) {}

  async execute(dto: CreateSharedVaultDTO): Promise<Result<CreateSharedVaultResult>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(userUuidOrError.getError())
    }
    const userUuid = userUuidOrError.getValue()

    const timestamps = Timestamps.create(
      this.timer.getTimestampInMicroseconds(),
      this.timer.getTimestampInMicroseconds(),
    ).getValue()

    const sharedVaultOrError = SharedVault.create({
      fileUploadBytesLimit: this.FILE_UPLOAD_BYTES_LIMIT,
      fileUploadBytesUsed: 0,
      userUuid,
      timestamps,
    })
    if (sharedVaultOrError.isFailed()) {
      return Result.fail(sharedVaultOrError.getError())
    }
    const sharedVault = sharedVaultOrError.getValue()

    await this.sharedVaultRepository.save(sharedVault)

    const sharedVaultUserOrError = await this.addUserToSharedVault.execute({
      sharedVaultUuid: sharedVault.id.toString(),
      userUuid: dto.userUuid,
      permission: 'admin',
    })
    if (sharedVaultUserOrError.isFailed()) {
      return Result.fail(sharedVaultUserOrError.getError())
    }
    const sharedVaultUser = sharedVaultUserOrError.getValue()

    return Result.ok({ sharedVault, sharedVaultUser })
  }
}
