import { Logger } from 'winston'
import { Result } from '@standardnotes/domain-core'
import { PaymentsAccountDeletedEvent } from '@standardnotes/domain-events'

import { DeleteAccount } from '../UseCase/DeleteAccount/DeleteAccount'
import { PaymentsAccountDeletedEventHandler } from './PaymentsAccountDeletedEventHandler'

describe('PaymentsAccountDeletedEventHandler', () => {
  let deleteAccountUseCase: DeleteAccount
  let logger: Logger
  let event: PaymentsAccountDeletedEvent

  const createHandler = () => new PaymentsAccountDeletedEventHandler(deleteAccountUseCase, logger)

  beforeEach(() => {
    deleteAccountUseCase = {} as jest.Mocked<DeleteAccount>
    deleteAccountUseCase.execute = jest.fn().mockResolvedValue(Result.ok('success'))

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    event = {
      payload: {
        username: 'username',
      },
    } as jest.Mocked<PaymentsAccountDeletedEvent>
  })

  it('should delete account', async () => {
    const handler = createHandler()

    await handler.handle(event)

    expect(deleteAccountUseCase.execute).toHaveBeenCalledWith({
      username: 'username',
    })
  })

  it('should log error if delete account fails', async () => {
    const handler = createHandler()

    deleteAccountUseCase.execute = jest.fn().mockResolvedValue(Result.fail('error'))

    await handler.handle(event)

    expect(logger.error).toHaveBeenCalledWith('Failed to delete account for user username: error')
  })
})
