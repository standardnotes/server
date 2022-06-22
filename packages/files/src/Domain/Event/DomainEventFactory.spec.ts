import 'reflect-metadata'

import { TimerInterface } from '@standardnotes/time'

import { DomainEventFactory } from './DomainEventFactory'

describe('DomainEventFactory', () => {
  let timer: TimerInterface

  const createFactory = () => new DomainEventFactory(timer)

  beforeEach(() => {
    timer = {} as jest.Mocked<TimerInterface>
    timer.getUTCDate = jest.fn().mockReturnValue(new Date(1))
  })

  it('should create a FILE_UPLOADED event', () => {
    expect(
      createFactory().createFileUploadedEvent({
        fileByteSize: 123,
        fileName: '2-3-4',
        filePath: '1-2-3/2-3-4',
        userUuid: '1-2-3',
      }),
    ).toEqual({
      createdAt: new Date(1),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'files',
      },
      payload: {
        fileByteSize: 123,
        fileName: '2-3-4',
        filePath: '1-2-3/2-3-4',
        userUuid: '1-2-3',
      },
      type: 'FILE_UPLOADED',
    })
  })

  it('should create a FILE_REMOVED event', () => {
    expect(
      createFactory().createFileRemovedEvent({
        fileByteSize: 123,
        fileName: '2-3-4',
        filePath: '1-2-3/2-3-4',
        userUuid: '1-2-3',
        regularSubscriptionUuid: '1-2-3',
      }),
    ).toEqual({
      createdAt: new Date(1),
      meta: {
        correlation: {
          userIdentifier: '1-2-3',
          userIdentifierType: 'uuid',
        },
        origin: 'files',
      },
      payload: {
        fileByteSize: 123,
        fileName: '2-3-4',
        filePath: '1-2-3/2-3-4',
        userUuid: '1-2-3',
        regularSubscriptionUuid: '1-2-3',
      },
      type: 'FILE_REMOVED',
    })
  })
})
