import { CryptoNode } from '@standardnotes/sncrypto-node'
import { TimerInterface } from '@standardnotes/time'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../../../Bootstrap/Types'
import { SubscriptionTokenRepositoryInterface } from '../../Subscription/SubscriptionTokenRepositoryInterface'
import { UseCaseInterface } from '../UseCaseInterface'
import { CreateSubscriptionTokenDTO } from './CreateSubscriptionTokenDTO'
import { CreateSubscriptionTokenResponse } from './CreateSubscriptionTokenResponse'

@injectable()
export class CreateSubscriptionToken implements UseCaseInterface {
  constructor(
    @inject(TYPES.SubscriptionTokenRepository)
    private subscriptionTokenRepository: SubscriptionTokenRepositoryInterface,
    @inject(TYPES.CryptoNode) private cryptoNode: CryptoNode,
    @inject(TYPES.Timer) private timer: TimerInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: CreateSubscriptionTokenDTO): Promise<CreateSubscriptionTokenResponse> {
    const token = await this.cryptoNode.generateRandomKey(128)

    const subscriptionToken = {
      userUuid: dto.userUuid,
      token,
      expiresAt: this.timer.convertStringDateToMicroseconds(this.timer.getUTCDateNHoursAhead(3).toString()),
    }

    const subscriptionTokenWasSaved = await this.subscriptionTokenRepository.save(subscriptionToken)

    if (!subscriptionTokenWasSaved) {
      this.logger.error(`Could not create subscription token for user ${dto.userUuid}`)

      throw new Error('Could not create subscription token')
    }

    return {
      subscriptionToken,
    }
  }
}
