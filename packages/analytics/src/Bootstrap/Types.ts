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
  ADMIN_EMAILS: Symbol.for('ADMIN_EMAILS'),
  MIXPANEL_TOKEN: Symbol.for('MIXPANEL_TOKEN'),
  // Repositories
  AnalyticsEntityRepository: Symbol.for('AnalyticsEntityRepository'),
  RevenueModificationRepository: Symbol.for('RevenueModificationRepository'),
  StatisticMeasureRepository: Symbol.for('StatisticMeasureRepository'),
  // ORM
  ORMAnalyticsEntityRepository: Symbol.for('ORMAnalyticsEntityRepository'),
  ORMRevenueModificationRepository: Symbol.for('ORMRevenueModificationRepository'),
  // Use Case
  GetUserAnalyticsId: Symbol.for('GetUserAnalyticsId'),
  SaveRevenueModification: Symbol.for('SaveRevenueModification'),
  CalculateMonthlyRecurringRevenue: Symbol.for('CalculateMonthlyRecurringRevenue'),
  PersistStatistic: Symbol.for('PersistStatistic'),
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
  StatisticPersistenceRequestedEventHandler: Symbol.for('StatisticPersistenceRequestedEventHandler'),
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
  MixpanelClient: Symbol.for('MixpanelClient'),
}

export default TYPES
