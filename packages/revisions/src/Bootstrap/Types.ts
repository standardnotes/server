const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SQS: Symbol.for('SQS'),
  S3: Symbol.for('S3'),
  // Map
  RevisionMetadataPersistenceMapper: Symbol.for('RevisionMetadataPersistenceMapper'),
  RevisionPersistenceMapper: Symbol.for('RevisionPersistenceMapper'),
  RevisionItemStringMapper: Symbol.for('RevisionItemStringMapper'),
  // ORM
  ORMRevisionRepository: Symbol.for('ORMRevisionRepository'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  DumpRepository: Symbol.for('DumpRepository'),
  // env vars
  REDIS_URL: Symbol.for('REDIS_URL'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  S3_AWS_REGION: Symbol.for('S3_AWS_REGION'),
  S3_BACKUP_BUCKET_NAME: Symbol.for('S3_BACKUP_BUCKET_NAME'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  GetRevisionsMetada: Symbol.for('GetRevisionsMetada'),
  // Controller
  RevisionsController: Symbol.for('RevisionsController'),
  // Handlers
  ItemDumpedEventHandler: Symbol.for('ItemDumpedEventHandler'),
  // Services
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  Timer: Symbol.for('Timer'),
  // Middleware
  ApiGatewayAuthMiddleware: Symbol.for('ApiGatewayAuthMiddleware'),
}

export default TYPES
