import { Result, UseCaseInterface, Uuid } from '@standardnotes/domain-core'
import { Logger } from 'winston'

import { SendEventToClientsDTO } from './SendEventToClientsDTO'
import { SendEventToClient } from '../SendEventToClient/SendEventToClient'
import { SharedVaultUserRepositoryInterface } from '../../../SharedVault/User/SharedVaultUserRepositoryInterface'

export class SendEventToClients implements UseCaseInterface<void> {
  constructor(
    private sharedVaultUserRepository: SharedVaultUserRepositoryInterface,
    private sendEventToClient: SendEventToClient,
    private logger: Logger,
  ) {}

  async execute(dto: SendEventToClientsDTO): Promise<Result<void>> {
    const sharedVaultUuidOrError = Uuid.create(dto.sharedVaultUuid)
    if (sharedVaultUuidOrError.isFailed()) {
      return Result.fail(sharedVaultUuidOrError.getError())
    }
    const sharedVaultUuid = sharedVaultUuidOrError.getValue()

    const originatingUserUuidOrError = Uuid.create(dto.originatingUserUuid)
    if (originatingUserUuidOrError.isFailed()) {
      return Result.fail(originatingUserUuidOrError.getError())
    }
    const originatingUserUuid = originatingUserUuidOrError.getValue()

    const sharedVaultUsers = await this.sharedVaultUserRepository.findBySharedVaultUuid(sharedVaultUuid)

    for (const sharedVaultUser of sharedVaultUsers) {
      if (originatingUserUuid.equals(sharedVaultUser.props.userUuid)) {
        continue
      }

      const result = await this.sendEventToClient.execute({
        event: dto.event,
        userUuid: sharedVaultUser.props.userUuid.value,
      })

      if (result.isFailed()) {
        this.logger.error(`Failed to send event to client: ${result.getError()}`, {
          userId: sharedVaultUser.props.userUuid.value,
          sharedVaultUuid: sharedVaultUuid.value,
        })
      }
    }

    return Result.ok()
  }
}
