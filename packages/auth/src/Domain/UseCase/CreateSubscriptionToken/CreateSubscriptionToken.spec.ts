import 'reflect-metadata'

import { CryptoNode } from '@standardnotes/sncrypto-node'
import { TimerInterface } from '@standardnotes/time'
import { SubscriptionTokenRepositoryInterface } from '../../Subscription/SubscriptionTokenRepositoryInterface'

import { CreateSubscriptionToken } from './CreateSubscriptionToken'

describe('CreateSubscriptionToken', () => {
  let subscriptionTokenRepository: SubscriptionTokenRepositoryInterface
  let cryptoNode: CryptoNode
  let timer: TimerInterface

  const createUseCase = () => new CreateSubscriptionToken(subscriptionTokenRepository, cryptoNode, timer)

  beforeEach(() => {
    subscriptionTokenRepository = {} as jest.Mocked<SubscriptionTokenRepositoryInterface>
    subscriptionTokenRepository.save = jest.fn()

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValueOnce('random-string')

    timer = {} as jest.Mocked<TimerInterface>
    timer.convertStringDateToMicroseconds = jest.fn().mockReturnValue(1)
    timer.getUTCDateNHoursAhead = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create an subscription token and persist it', async () => {
    await createUseCase().execute({
      userUuid: '1-2-3',
    })

    expect(subscriptionTokenRepository.save).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      token: 'random-string',
      expiresAt: 1,
    })
  })
})
