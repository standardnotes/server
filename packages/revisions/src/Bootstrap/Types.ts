const TYPES = {
  Revisions_DBConnection: Symbol.for('Revisions_DBConnection'),
  Revisions_Logger: Symbol.for('Revisions_Logger'),
  Revisions_SQS: Symbol.for('Revisions_SQS'),
  Revisions_S3: Symbol.for('Revisions_S3'),
  Revisions_Env: Symbol.for('Revisions_Env'),
  // Map
  Revisions_RevisionMetadataPersistenceMapper: Symbol.for('Revisions_RevisionMetadataPersistenceMapper'),
  Revisions_RevisionPersistenceMapper: Symbol.for('Revisions_RevisionPersistenceMapper'),
  Revisions_RevisionItemStringMapper: Symbol.for('Revisions_RevisionItemStringMapper'),
  Revisions_RevisionHttpMapper: Symbol.for('Revisions_RevisionHttpMapper'),
  Revisions_RevisionMetadataHttpMapper: Symbol.for('Revisions_RevisionMetadataHttpMapper'),
  // ORM
  Revisions_ORMRevisionRepository: Symbol.for('Revisions_ORMRevisionRepository'),
  // Repositories
  Revisions_RevisionRepository: Symbol.for('Revisions_RevisionRepository'),
  Revisions_DumpRepository: Symbol.for('Revisions_DumpRepository'),
  // env vars
  Revisions_AUTH_JWT_SECRET: Symbol.for('Revisions_AUTH_JWT_SECRET'),
  Revisions_SQS_QUEUE_URL: Symbol.for('Revisions_SQS_QUEUE_URL'),
  Revisions_SQS_AWS_REGION: Symbol.for('Revisions_SQS_AWS_REGION'),
  Revisions_S3_AWS_REGION: Symbol.for('Revisions_S3_AWS_REGION'),
  Revisions_S3_BACKUP_BUCKET_NAME: Symbol.for('Revisions_S3_BACKUP_BUCKET_NAME'),
  Revisions_NEW_RELIC_ENABLED: Symbol.for('Revisions_NEW_RELIC_ENABLED'),
  Revisions_VERSION: Symbol.for('Revisions_VERSION'),
  // use cases
  Revisions_GetRevisionsMetada: Symbol.for('Revisions_GetRevisionsMetada'),
  Revisions_GetRevision: Symbol.for('Revisions_GetRevision'),
  Revisions_DeleteRevision: Symbol.for('Revisions_DeleteRevision'),
  Revisions_CopyRevisions: Symbol.for('Revisions_CopyRevisions'),
  Revisions_GetRequiredRoleToViewRevision: Symbol.for('Revisions_GetRequiredRoleToViewRevision'),
  // Controller
  Revisions_ControllerContainer: Symbol.for('Revisions_ControllerContainer'),
  Revisions_RevisionsController: Symbol.for('Revisions_RevisionsController'),
  Revisions_ApiGatewayAuthMiddleware: Symbol.for('Revisions_ApiGatewayAuthMiddleware'),
  // Handlers
  Revisions_ItemDumpedEventHandler: Symbol.for('Revisions_ItemDumpedEventHandler'),
  Revisions_AccountDeletionRequestedEventHandler: Symbol.for('Revisions_AccountDeletionRequestedEventHandler'),
  Revisions_RevisionsCopyRequestedEventHandler: Symbol.for('Revisions_RevisionsCopyRequestedEventHandler'),
  // Services
  Revisions_CrossServiceTokenDecoder: Symbol.for('Revisions_CrossServiceTokenDecoder'),
  Revisions_DomainEventSubscriberFactory: Symbol.for('Revisions_DomainEventSubscriberFactory'),
  Revisions_DomainEventMessageHandler: Symbol.for('Revisions_DomainEventMessageHandler'),
  Revisions_Timer: Symbol.for('Revisions_Timer'),
  // Inversify Express Controllers
  Revisions_InversifyExpressRevisionsController: Symbol.for('Revisions_InversifyExpressRevisionsController'),
}

export default TYPES
