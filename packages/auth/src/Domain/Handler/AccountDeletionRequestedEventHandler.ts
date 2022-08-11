import { AnalyticsActivity, AnalyticsStoreInterface, Period } from '@standardnotes/analytics'
import { AccountDeletionRequestedEvent, DomainEventHandlerInterface } from '@standardnotes/domain-events'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { EphemeralSessionRepositoryInterface } from '../Session/EphemeralSessionRepositoryInterface'
import { RevokedSessionRepositoryInterface } from '../Session/RevokedSessionRepositoryInterface'
import { SessionRepositoryInterface } from '../Session/SessionRepositoryInterface'
import { GetUserAnalyticsId } from '../UseCase/GetUserAnalyticsId/GetUserAnalyticsId'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'

@injectable()
export class AccountDeletionRequestedEventHandler implements DomainEventHandlerInterface {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.SessionRepository) private sessionRepository: SessionRepositoryInterface,
    @inject(TYPES.EphemeralSessionRepository) private ephemeralSessionRepository: EphemeralSessionRepositoryInterface,
    @inject(TYPES.RevokedSessionRepository) private revokedSessionRepository: RevokedSessionRepositoryInterface,
    @inject(TYPES.GetUserAnalyticsId) private getUserAnalyticsId: GetUserAnalyticsId,
    @inject(TYPES.AnalyticsStore) private analyticsStore: AnalyticsStoreInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async handle(event: AccountDeletionRequestedEvent): Promise<void> {
    const user = await this.userRepository.findOneByUuid(event.payload.userUuid)

    if (user === null) {
      this.logger.warn(`Could not find user with uuid: ${event.payload.userUuid}`)

      return
    }

    await this.removeSessions(event.payload.userUuid)

    const { analyticsId } = await this.getUserAnalyticsId.execute({ userUuid: user.uuid })
    await this.analyticsStore.markActivity([AnalyticsActivity.DeleteAccount], analyticsId, [
      Period.Today,
      Period.ThisWeek,
      Period.ThisMonth,
    ])

    await this.userRepository.remove(user)

    this.logger.info(`Finished account cleanup for user: ${event.payload.userUuid}`)
  }

  private async removeSessions(userUuid: string): Promise<void> {
    const sessions = await this.sessionRepository.findAllByUserUuid(userUuid)
    for (const session of sessions) {
      await this.sessionRepository.remove(session)
    }

    const ephemeralSessions = await this.ephemeralSessionRepository.findAllByUserUuid(userUuid)
    for (const ephemeralSession of ephemeralSessions) {
      await this.ephemeralSessionRepository.deleteOne(ephemeralSession.uuid, ephemeralSession.userUuid)
    }

    const revokedSessions = await this.revokedSessionRepository.findAllByUserUuid(userUuid)
    for (const revokedSession of revokedSessions) {
      await this.revokedSessionRepository.remove(revokedSession)
    }
  }
}
