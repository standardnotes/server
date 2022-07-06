import * as AWS from 'aws-sdk'
import * as zlib from 'zlib'

import { DomainEventInterface, DomainEventPublisherInterface } from '@standardnotes/domain-events'

export class SNSDomainEventPublisher implements DomainEventPublisherInterface {
  constructor(private snsClient: AWS.SNS, private topicArn: string) {}

  async publish(event: DomainEventInterface): Promise<void> {
    const message: AWS.SNS.PublishInput = {
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
      ;(message.MessageAttributes as AWS.SNS.MessageAttributeMap).target = {
        DataType: 'String',
        StringValue: event.meta.target,
      }
    }

    await this.snsClient.publish(message).promise()
  }
}
