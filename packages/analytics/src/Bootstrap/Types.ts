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
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  // Repositories
  AnalyticsEntityRepository: Symbol.for('AnalyticsEntityRepository'),
  RevenueModificationRepository: Symbol.for('RevenueModificationRepository'),
  // ORM
  ORMAnalyticsEntityRepository: Symbol.for('ORMAnalyticsEntityRepository'),
  ORMRevenueModificationRepository: Symbol.for('ORMRevenueModificationRepository'),
  // Use Case
  GetUserAnalyticsId: Symbol.for('GetUserAnalyticsId'),
  SaveRevenueModification: Symbol.for('SaveRevenueModification'),
  // Handlers
  UserRegisteredEventHandler: Symbol.for('UserRegisteredEventHandler'),
  AccountDeletionRequestedEventHandler: Symbol.for('AccountDeletionRequestedEventHandler'),
  PaymentFailedEventHandler: Symbol.for('PaymentFailedEventHandler'),
  PaymentSuccessEventHandler: Symbol.for('PaymentSuccessEventHandler'),
  SubscriptionCancelledEventHandler: Symbol.for('SubscriptionCancelledEventHandler'),
  SubscriptionRenewedEventHandler: Symbol.for('SubscriptionRenewedEventHandler'),
  SubscriptionRefundedEventHandler: Symbol.for('SubscriptionRefundedEventHandler'),
  SubscriptionPurchasedEventHandler: Symbol.for('SubscriptionPurchasedEventHandler'),
  SubscriptionExpiredEventHandler: Symbol.for('SubscriptionExpiredEventHandler'),
  SubscriptionReactivatedEventHandler: Symbol.for('SubscriptionReactivatedEventHandler'),
  RefundProcessedEventHandler: Symbol.for('RefundProcessedEventHandler'),
  // Maps
  RevenueModificationMap: Symbol.for('RevenueModificationMap'),
  // Services
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  AnalyticsStore: Symbol.for('AnalyticsStore'),
  StatisticsStore: Symbol.for('StatisticsStore'),
  Timer: Symbol.for('Timer'),
  PeriodKeyGenerator: Symbol.for('PeriodKeyGenerator'),
}

export default TYPES
