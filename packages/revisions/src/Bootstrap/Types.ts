const TYPES = {
  DBConnection: Symbol.for('DBConnection'),
  Logger: Symbol.for('Logger'),
  SQS: Symbol.for('SQS'),
  S3: Symbol.for('S3'),
  Env: Symbol.for('Env'),
  // Map
  RevisionMetadataPersistenceMapper: Symbol.for('RevisionMetadataPersistenceMapper'),
  RevisionPersistenceMapper: Symbol.for('RevisionPersistenceMapper'),
  RevisionItemStringMapper: Symbol.for('RevisionItemStringMapper'),
  RevisionHttpMapper: Symbol.for('RevisionHttpMapper'),
  RevisionMetadataHttpMapper: Symbol.for('RevisionMetadataHttpMapper'),
  // ORM
  ORMRevisionRepository: Symbol.for('ORMRevisionRepository'),
  // Repositories
  RevisionRepository: Symbol.for('RevisionRepository'),
  DumpRepository: Symbol.for('DumpRepository'),
  // env vars
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  S3_AWS_REGION: Symbol.for('S3_AWS_REGION'),
  S3_BACKUP_BUCKET_NAME: Symbol.for('S3_BACKUP_BUCKET_NAME'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  GetRevisionsMetada: Symbol.for('GetRevisionsMetada'),
  GetRevision: Symbol.for('GetRevision'),
  DeleteRevision: Symbol.for('DeleteRevision'),
  CopyRevisions: Symbol.for('CopyRevisions'),
  GetRequiredRoleToViewRevision: Symbol.for('GetRequiredRoleToViewRevision'),
  // Controller
  RevisionsController: Symbol.for('RevisionsController'),
  ApiGatewayAuthMiddleware: Symbol.for('ApiGatewayAuthMiddleware'),
  // Handlers
  ItemDumpedEventHandler: Symbol.for('ItemDumpedEventHandler'),
  AccountDeletionRequestedEventHandler: Symbol.for('AccountDeletionRequestedEventHandler'),
  RevisionsCopyRequestedEventHandler: Symbol.for('RevisionsCopyRequestedEventHandler'),
  RevisionsOwnershipUpdateRequestedEventHandler: Symbol.for('RevisionsOwnershipUpdateRequestedEventHandler'),
  // Services
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  Timer: Symbol.for('Timer'),
}

export default TYPES
