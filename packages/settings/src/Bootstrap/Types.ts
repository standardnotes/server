const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SQS: Symbol.for('SQS'),
  // Map
  SettingPersistenceMapper: Symbol.for('SettingPersistenceMapper'),
  // ORM
  ORMSettingRepository: Symbol.for('ORMSettingRepository'),
  // Repositories
  SettingRepository: Symbol.for('SettingRepository'),
  // env vars
  REDIS_URL: Symbol.for('REDIS_URL'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  // Controller
  SettingsController: Symbol.for('SettingsController'),
  // Handlers
  // Services
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  Timer: Symbol.for('Timer'),
  // Middleware
  ApiGatewayAuthMiddleware: Symbol.for('ApiGatewayAuthMiddleware'),
}

export default TYPES
