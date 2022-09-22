import 'reflect-metadata'

import { CryptoNode } from '@standardnotes/sncrypto-node'
import { SubscriptionTokenRepositoryInterface } from '../../Subscription/SubscriptionTokenRepositoryInterface'

import { CreateSubscriptionToken } from './CreateSubscriptionToken'
import { Logger } from 'winston'

describe('CreateSubscriptionToken', () => {
  let subscriptionTokenRepository: SubscriptionTokenRepositoryInterface
  let cryptoNode: CryptoNode
  let logger: Logger

  const createUseCase = () => new CreateSubscriptionToken(subscriptionTokenRepository, cryptoNode, logger)

  beforeEach(() => {
    subscriptionTokenRepository = {} as jest.Mocked<SubscriptionTokenRepositoryInterface>
    subscriptionTokenRepository.save = jest.fn().mockReturnValue(true)

    cryptoNode = {} as jest.Mocked<CryptoNode>
    cryptoNode.generateRandomKey = jest.fn().mockReturnValueOnce('random-string')

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()
  })

  it('should create an subscription token and persist it', async () => {
    await createUseCase().execute({
      userUuid: '1-2-3',
    })

    expect(subscriptionTokenRepository.save).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      token: 'random-string',
      ttl: 10_800,
    })
  })

  it('should throw an error if the subscription token was not created', async () => {
    subscriptionTokenRepository.save = jest.fn().mockReturnValue(false)

    let caughtError = null
    try {
      await createUseCase().execute({
        userUuid: '1-2-3',
      })
    } catch (error) {
      caughtError = error
    }

    expect(caughtError).not.toBeNull()
  })
})
