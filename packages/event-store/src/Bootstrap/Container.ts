import * as AWS from 'aws-sdk'
import * as winston from 'winston'
import { Container } from 'inversify'
import { Event } from '../Domain/Event/Event'
import { Env } from './Env'
import TYPES from './Types'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { Timer, TimerInterface } from '@standardnotes/time'
import { EventHandler } from '../Domain/Handler/EventHandler'
import { AppDataSource } from './DataSource'
import { Repository } from 'typeorm'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    await AppDataSource.initialize()

    container.bind<AWS.SQS>(TYPES.SQS).toConstantValue(
      new AWS.SQS({
        apiVersion: 'latest',
        region: env.get('SQS_AWS_REGION'),
      }),
    )

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(winston.format.splat(), winston.format.json()),
      transports: [new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' })],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    container.bind<TimerInterface>(TYPES.Timer).toConstantValue(new Timer())

    // env vars
    container.bind(TYPES.SQS_AWS_REGION).toConstantValue(env.get('SQS_AWS_REGION'))
    container.bind(TYPES.SQS_QUEUE_URL).toConstantValue(env.get('SQS_QUEUE_URL'))

    // ORM
    container.bind<Repository<Event>>(TYPES.ORMEventRepository).toConstantValue(AppDataSource.getRepository(Event))

    // Handlers
    container.bind<EventHandler>(TYPES.EventHandler).to(EventHandler)

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_REGISTERED', container.get(TYPES.EventHandler)],
      ['ACCOUNT_DELETION_REQUESTED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_PURCHASED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_CANCELLED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_RENEWED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_REFUNDED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_SYNC_REQUESTED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_EXPIRED', container.get(TYPES.EventHandler)],
      ['EXTENSION_KEY_GRANTED', container.get(TYPES.EventHandler)],
      ['SUBSCRIPTION_REASSIGNED', container.get(TYPES.EventHandler)],
      ['USER_EMAIL_CHANGED', container.get(TYPES.EventHandler)],
      ['FILE_UPLOADED', container.get(TYPES.EventHandler)],
      ['FILE_REMOVED', container.get(TYPES.EventHandler)],
      ['LISTED_ACCOUNT_REQUESTED', container.get(TYPES.EventHandler)],
      ['LISTED_ACCOUNT_CREATED', container.get(TYPES.EventHandler)],
      ['LISTED_ACCOUNT_DELETED', container.get(TYPES.EventHandler)],
      ['USER_SIGNED_IN', container.get(TYPES.EventHandler)],
      ['SHARED_SUBSCRIPTION_INVITATION_CREATED', container.get(TYPES.EventHandler)],
      ['EMAIL_BACKUP_ATTACHMENT_CREATED', container.get(TYPES.EventHandler)],
      ['EMAIL_BACKUP_REQUESTED', container.get(TYPES.EventHandler)],
      ['OFFLINE_SUBSCRIPTION_TOKEN_CREATED', container.get(TYPES.EventHandler)],
    ])

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toConstantValue(
        env.get('NEW_RELIC_ENABLED', true) === 'true'
          ? new SQSNewRelicEventMessageHandler(eventHandlers, container.get(TYPES.Logger))
          : new SQSEventMessageHandler(eventHandlers, container.get(TYPES.Logger)),
      )
    container
      .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
      .toConstantValue(
        new SQSDomainEventSubscriberFactory(
          container.get(TYPES.SQS),
          container.get(TYPES.SQS_QUEUE_URL),
          container.get(TYPES.DomainEventMessageHandler),
        ),
      )

    return container
  }
}
