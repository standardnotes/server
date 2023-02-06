const TYPES = {
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SNS: Symbol.for('SNS'),
  SQS: Symbol.for('SQS'),
  // env vars
  REDIS_URL: Symbol.for('REDIS_URL'),
  SNS_TOPIC_ARN: Symbol.for('SNS_TOPIC_ARN'),
  SNS_AWS_REGION: Symbol.for('SNS_AWS_REGION'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  // Repositories
  PredicateRepository: Symbol.for('PredicateRepository'),
  JobRepository: Symbol.for('JobRepository'),
  // ORM
  ORMPredicateRepository: Symbol.for('ORMPredicateRepository'),
  ORMJobRepository: Symbol.for('ORMJobRepository'),
  // Use Case
  UpdatePredicateStatus: Symbol.for('UpdatePredicateStatus'),
  VerifyPredicates: Symbol.for('VerifyPredicates'),
  // Handlers
  PredicateVerifiedEventHandler: Symbol.for('PredicateVerifiedEventHandler'),
  UserRegisteredEventHandler: Symbol.for('UserRegisteredEventHandler'),
  SubscriptionCancelledEventHandler: Symbol.for('SubscriptionCancelledEventHandler'),
  ExitDiscountAppliedEventHandler: Symbol.for('ExitDiscountAppliedEventHandler'),
  // Services
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  Timer: Symbol.for('Timer'),
  JobDoneInterpreter: Symbol.for('JobDoneInterpreter'),
}

export default TYPES
