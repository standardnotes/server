import 'reflect-metadata'

import * as AWS from 'aws-sdk'

import { DomainEventInterface, DomainEventService } from '@standardnotes/domain-events'

import { SNSDomainEventPublisher } from './SNSDomainEventPublisher'

describe('SNSDomainEventPublisher', () => {
  let sns: AWS.SNS
  const topicArn = 'test-topic-arn'
  let event: DomainEventInterface

  const createPublisher = () => new SNSDomainEventPublisher(sns, topicArn)

  beforeEach(() => {
    const publish = {} as jest.Mocked<AWS.Request<AWS.SNS.Types.PublishResponse, AWS.AWSError>>
    publish.promise = jest.fn().mockReturnValue(Promise.resolve())

    sns = {} as jest.Mocked<AWS.SNS>
    sns.publish = jest.fn().mockReturnValue(publish)

    event = {} as jest.Mocked<DomainEventInterface>
    event.type = 'TEST'
    event.payload = { foo: 'bar' }
    event.createdAt = new Date(1)
    event.meta = {
      correlation: {
        userIdentifier: '1-2-3',
        userIdentifierType: 'uuid',
      },
      origin: DomainEventService.Auth,
    }
  })

  it('should publish a domain event', async () => {
    await createPublisher().publish(event)

    expect(sns.publish).toHaveBeenCalledWith({
      Message:
        'eJxVjrEOwjAMRP/Fc4MSGBDZGBiYycRmGhcilaZynaGq8u84MCHdcmc/nzeQdSbwEC63AB3MuI4ZI/gNhpw1fyBD7aBnQqF4Fo3c6WiNdapgrf9qZ627K/4mwcb2mZlGlJSnZstCfI00SRoScTth9uag+/+D8HullBRbZ+b0TMoDFnlBrR+YQDXz',
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: 'TEST',
        },
        compression: {
          DataType: 'String',
          StringValue: 'true',
        },
        origin: {
          DataType: 'String',
          StringValue: 'auth',
        },
      },
      TopicArn: 'test-topic-arn',
    })
  })

  it('should publish a targeted domain event', async () => {
    event.meta.target = DomainEventService.SyncingServer

    await createPublisher().publish(event)

    expect(sns.publish).toHaveBeenCalledWith({
      Message:
        'eJxVjrEOwjAMRP/Fc4NSGBDdGBiYycRmGrdEKknlOkhVlX/HgQnJi8/3zreBrDNBB+5yc9DAjOuU0EO3wZCS6g9kKA30TCjkz6JSezpaY1sdZ233nZ217V3xFwlWtk/MNKGEFOuaF+KrpyhhCMQ1wuzNQf3/B/erknPw9WfiMAblAbM81SzII9UCyxr7EEej8FvjSvkAg/8/Jw==',
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: 'TEST',
        },
        compression: {
          DataType: 'String',
          StringValue: 'true',
        },
        origin: {
          DataType: 'String',
          StringValue: 'auth',
        },
        target: {
          DataType: 'String',
          StringValue: 'syncing-server',
        },
      },
      TopicArn: 'test-topic-arn',
    })
  })
})
