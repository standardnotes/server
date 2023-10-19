import { Result } from '@standardnotes/domain-core'
import { RevisionsCopyRequestedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import { CopyRevisions } from '../UseCase/CopyRevisions/CopyRevisions'
import { RevisionsCopyRequestedEventHandler } from './RevisionsCopyRequestedEventHandler'

describe('RevisionsCopyRequestedEventHandler', () => {
  let copyRevisions: CopyRevisions
  let logger: Logger
  let event: RevisionsCopyRequestedEvent

  const createHandler = () => new RevisionsCopyRequestedEventHandler(copyRevisions, logger)

  beforeEach(() => {
    copyRevisions = {} as jest.Mocked<CopyRevisions>
    copyRevisions.execute = jest.fn().mockReturnValue(Result.ok())

    logger = {} as jest.Mocked<Logger>
    logger.error = jest.fn()

    event = {} as jest.Mocked<RevisionsCopyRequestedEvent>
    event.payload = {
      newItemUuid: '1-2-3',
      originalItemUuid: '2-3-4',
    }
  })

  it('should copy revisions', async () => {
    await createHandler().handle(event)

    expect(copyRevisions.execute).toHaveBeenCalled()
  })

  it('should indicate if copying revisions fail', async () => {
    copyRevisions.execute = jest.fn().mockReturnValue(Result.fail('Oops'))

    await createHandler().handle(event)

    expect(logger.error).toHaveBeenCalled()
  })
})
