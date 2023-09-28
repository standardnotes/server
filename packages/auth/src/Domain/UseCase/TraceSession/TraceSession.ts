import { Result, SubscriptionPlanName, UseCaseInterface, Username, Uuid } from '@standardnotes/domain-core'
import { TimerInterface } from '@standardnotes/time'

import { SessionTrace } from '../../Session/SessionTrace'
import { SessionTraceRepositoryInterface } from '../../Session/SessionTraceRepositoryInterface'
import { TraceSessionDTO } from './TraceSessionDTO'

export class TraceSession implements UseCaseInterface<SessionTrace> {
  constructor(
    private sessionTraceRepository: SessionTraceRepositoryInterface,
    private timer: TimerInterface,
    private sessionTraceDaysTTL: number,
  ) {}

  async execute(dto: TraceSessionDTO): Promise<Result<SessionTrace>> {
    const userUuidOrError = Uuid.create(dto.userUuid)
    if (userUuidOrError.isFailed()) {
      return Result.fail(`Failed to trace session: ${userUuidOrError.getError()}`)
    }
    const userUuid = userUuidOrError.getValue()

    const usernameOrError = Username.create(dto.username)
    if (usernameOrError.isFailed()) {
      return Result.fail(`Failed to trace session: ${usernameOrError.getError()}`)
    }
    const username = usernameOrError.getValue()

    let subscriptionPlanName = null
    if (dto.subscriptionPlanName !== null) {
      const subscriptionPlanNameOrError = SubscriptionPlanName.create(dto.subscriptionPlanName)
      if (subscriptionPlanNameOrError.isFailed()) {
        return Result.fail(`Failed to trace session: ${subscriptionPlanNameOrError.getError()}`)
      }
      subscriptionPlanName = subscriptionPlanNameOrError.getValue()
    }

    const alreadyExistingTrace = await this.sessionTraceRepository.findOneByUserUuidAndDate(userUuid, new Date())
    if (alreadyExistingTrace !== null) {
      return Result.ok<SessionTrace>(alreadyExistingTrace)
    }

    const expiresAt = this.timer.getUTCDateNDaysAhead(this.sessionTraceDaysTTL)

    const sessionTraceOrError = SessionTrace.create({
      userUuid,
      username,
      subscriptionPlanName,
      createdAt: new Date(),
      expiresAt,
    })
    if (sessionTraceOrError.isFailed()) {
      return Result.fail(`Failed to trace session: ${sessionTraceOrError.getError()}`)
    }
    const sessionTrace = sessionTraceOrError.getValue()

    await this.sessionTraceRepository.insert(sessionTrace)

    return Result.ok<SessionTrace>(sessionTrace)
  }
}
