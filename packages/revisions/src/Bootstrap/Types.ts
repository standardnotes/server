const TYPES = {
  Revisions_DBConnection: Symbol.for('Revisions_DBConnection'),
  Revisions_Logger: Symbol.for('Revisions_Logger'),
  Revisions_SQS: Symbol.for('Revisions_SQS'),
  Revisions_SNS: Symbol.for('Revisions_SNS'),
  Revisions_S3: Symbol.for('Revisions_S3'),
  Revisions_Env: Symbol.for('Revisions_Env'),
  // Map
  Revisions_SQLLegacyRevisionMetadataPersistenceMapper: Symbol.for(
    'Revisions_SQLLegacyRevisionMetadataPersistenceMapper',
  ),
  Revisions_SQLRevisionMetadataPersistenceMapper: Symbol.for('Revisions_SQLRevisionMetadataPersistenceMapper'),
  Revisions_SQLLegacyRevisionPersistenceMapper: Symbol.for('Revisions_SQLLegacyRevisionPersistenceMapper'),
  Revisions_SQLRevisionPersistenceMapper: Symbol.for('Revisions_SQLRevisionPersistenceMapper'),
  Revisions_MongoDBRevisionMetadataPersistenceMapper: Symbol.for('Revisions_MongoDBRevisionMetadataPersistenceMapper'),
  Revisions_MongoDBRevisionPersistenceMapper: Symbol.for('Revisions_MongoDBRevisionPersistenceMapper'),
  Revisions_RevisionItemStringMapper: Symbol.for('Revisions_RevisionItemStringMapper'),
  Revisions_RevisionHttpMapper: Symbol.for('Revisions_RevisionHttpMapper'),
  Revisions_RevisionMetadataHttpMapper: Symbol.for('Revisions_RevisionMetadataHttpMapper'),
  // ORM
  Revisions_ORMRevisionRepository: Symbol.for('Revisions_ORMRevisionRepository'),
  Revisions_ORMLegacyRevisionRepository: Symbol.for('Revisions_ORMLegacyRevisionRepository'),
  // Mongo
  Revisions_ORMMongoRevisionRepository: Symbol.for('Revisions_ORMMongoRevisionRepository'),
  // Repositories
  Revisions_SQLRevisionRepository: Symbol.for('Revisions_SQLRevisionRepository'),
  Revisions_MongoDBRevisionRepository: Symbol.for('Revisions_MongoDBRevisionRepository'),
  Revisions_DumpRepository: Symbol.for('Revisions_DumpRepository'),
  Revisions_RevisionRepositoryResolver: Symbol.for('Revisions_RevisionRepositoryResolver'),
  // env vars
  Revisions_AUTH_JWT_SECRET: Symbol.for('Revisions_AUTH_JWT_SECRET'),
  Revisions_SQS_QUEUE_URL: Symbol.for('Revisions_SQS_QUEUE_URL'),
  Revisions_SQS_AWS_REGION: Symbol.for('Revisions_SQS_AWS_REGION'),
  Revisions_S3_AWS_REGION: Symbol.for('Revisions_S3_AWS_REGION'),
  Revisions_S3_BACKUP_BUCKET_NAME: Symbol.for('Revisions_S3_BACKUP_BUCKET_NAME'),
  Revisions_SNS_TOPIC_ARN: Symbol.for('Revisions_SNS_TOPIC_ARN'),
  Revisions_SNS_AWS_REGION: Symbol.for('Revisions_SNS_AWS_REGION'),
  Revisions_NEW_RELIC_ENABLED: Symbol.for('Revisions_NEW_RELIC_ENABLED'),
  Revisions_VERSION: Symbol.for('Revisions_VERSION'),
  // use cases
  Revisions_GetRevisionsMetada: Symbol.for('Revisions_GetRevisionsMetada'),
  Revisions_GetRevision: Symbol.for('Revisions_GetRevision'),
  Revisions_DeleteRevision: Symbol.for('Revisions_DeleteRevision'),
  Revisions_CopyRevisions: Symbol.for('Revisions_CopyRevisions'),
  Revisions_GetRequiredRoleToViewRevision: Symbol.for('Revisions_GetRequiredRoleToViewRevision'),
  Revisions_TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser: Symbol.for(
    'Revisions_TransitionRevisionsFromPrimaryToSecondaryDatabaseForUser',
  ),
  Revisions_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser: Symbol.for(
    'Revisions_TriggerTransitionFromPrimaryToSecondaryDatabaseForUser',
  ),
  Revisions_RemoveRevisionsFromSharedVault: Symbol.for('Revisions_RemoveRevisionsFromSharedVault'),
  // Controller
  Revisions_ControllerContainer: Symbol.for('Revisions_ControllerContainer'),
  Revisions_RevisionsController: Symbol.for('Revisions_RevisionsController'),
  Revisions_ApiGatewayAuthMiddleware: Symbol.for('Revisions_ApiGatewayAuthMiddleware'),
  // Handlers
  Revisions_ItemDumpedEventHandler: Symbol.for('Revisions_ItemDumpedEventHandler'),
  Revisions_AccountDeletionRequestedEventHandler: Symbol.for('Revisions_AccountDeletionRequestedEventHandler'),
  Revisions_RevisionsCopyRequestedEventHandler: Symbol.for('Revisions_RevisionsCopyRequestedEventHandler'),
  Revisions_TransitionStatusUpdatedEventHandler: Symbol.for('Revisions_TransitionStatusUpdatedEventHandler'),
  Revisions_ItemRemovedFromSharedVaultEventHandler: Symbol.for('Revisions_ItemRemovedFromSharedVaultEventHandler'),
  Revisions_TransitionRequestedEventHandler: Symbol.for('Revisions_TransitionRequestedEventHandler'),
  // Services
  Revisions_CrossServiceTokenDecoder: Symbol.for('Revisions_CrossServiceTokenDecoder'),
  Revisions_DomainEventSubscriberFactory: Symbol.for('Revisions_DomainEventSubscriberFactory'),
  Revisions_DomainEventMessageHandler: Symbol.for('Revisions_DomainEventMessageHandler'),
  Revisions_DomainEventPublisher: Symbol.for('Revisions_DomainEventPublisher'),
  Revisions_DomainEventFactory: Symbol.for('Revisions_DomainEventFactory'),
  Revisions_Timer: Symbol.for('Revisions_Timer'),
  // Inversify Express Controllers
  Revisions_BaseRevisionsController: Symbol.for('Revisions_BaseRevisionsController'),
}

export default TYPES
