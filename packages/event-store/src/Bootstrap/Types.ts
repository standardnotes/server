const TYPES = {
  Logger: Symbol.for('Logger'),
  SQS: Symbol.for('SQS'),
  // env vars
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  // Handlers
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  EventHandler: Symbol.for('EventHandler'),
  // ORM
  ORMEventRepository: Symbol.for('ORMEventRepository'),
  // Services
  Timer: Symbol.for('Timer'),
}

export default TYPES
