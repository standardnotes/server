import * as zlib from 'zlib'
import { MessageAttributeValue, PublishCommand, PublishCommandInput, SNSClient } from '@aws-sdk/client-sns'

import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

export class SNSDomainEventPublisher implements DomainEventPublisherInterface {
  constructor(private snsClient: SNSClient, private topicArn: string) {}

  async publish(event: DomainEventInterface): Promise<void> {
    const message: PublishCommandInput = {
      TopicArn: this.topicArn,
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: event.type,
        },
        compression: {
          DataType: 'String',
          StringValue: 'true',
        },
        origin: {
          DataType: 'String',
          StringValue: event.meta.origin,
        },
      },
      Message: zlib.deflateSync(JSON.stringify(event)).toString('base64'),
    }

    if (event.meta.target !== undefined) {
      ;(message.MessageAttributes as Record<string, MessageAttributeValue>).target = {
        DataType: 'String',
        StringValue: event.meta.target,
      }
    }

    const command = new PublishCommand(message)

    await this.snsClient.send(command)
  }
}
