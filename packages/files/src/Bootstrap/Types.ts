const TYPES = {
  Files_Logger: Symbol.for('Files_Logger'),
  Files_HTTPClient: Symbol.for('Files_HTTPClient'),
  Files_Redis: Symbol.for('Files_Redis'),
  Files_S3: Symbol.for('Files_S3'),
  Files_SNS: Symbol.for('Files_SNS'),
  Files_SQS: Symbol.for('Files_SQS'),
  Files_OTEL_PROPAGATOR: Symbol.for('Files_OTEL_PROPAGATOR'),

  // use cases
  Files_UploadFileChunk: Symbol.for('Files_UploadFileChunk'),
  Files_StreamDownloadFile: Symbol.for('Files_StreamDownloadFile'),
  Files_CreateUploadSession: Symbol.for('Files_CreateUploadSession'),
  Files_FinishUploadSession: Symbol.for('Files_FinishUploadSession'),
  Files_GetFileMetadata: Symbol.for('Files_GetFileMetadata'),
  Files_RemoveFile: Symbol.for('Files_RemoveFile'),
  Files_MoveFile: Symbol.for('Files_MoveFile'),
  Files_MarkFilesToBeRemoved: Symbol.for('Files_MarkFilesToBeRemoved'),

  // services
  Files_ValetTokenDecoder: Symbol.for('Files_ValetTokenDecoder'),
  Files_Timer: Symbol.for('Files_Timer'),
  Files_DomainEventFactory: Symbol.for('Files_DomainEventFactory'),
  Files_DomainEventPublisher: Symbol.for('Files_DomainEventPublisher'),
  Files_FileUploader: Symbol.for('Files_FileUploader'),
  Files_FileDownloader: Symbol.for('Files_FileDownloader'),
  Files_FileRemover: Symbol.for('Files_FileRemover'),
  Files_FileMover: Symbol.for('Files_FileMover'),

  // repositories
  Files_UploadRepository: Symbol.for('Files_UploadRepository'),

  // middleware
  Files_ValetTokenAuthMiddleware: Symbol.for('Files_ValetTokenAuthMiddleware'),
  Files_SharedVaultValetTokenAuthMiddleware: Symbol.for('Files_SharedVaultValetTokenAuthMiddleware'),

  // env vars
  Files_S3_ENDPOINT: Symbol.for('Files_S3_ENDPOINT'),
  Files_S3_BUCKET_NAME: Symbol.for('Files_S3_BUCKET_NAME'),
  Files_S3_AWS_REGION: Symbol.for('Files_S3_AWS_REGION'),
  Files_SNS_TOPIC_ARN: Symbol.for('Files_SNS_TOPIC_ARN'),
  Files_SNS_AWS_REGION: Symbol.for('Files_SNS_AWS_REGION'),
  Files_SQS_QUEUE_URL: Symbol.for('Files_SQS_QUEUE_URL'),
  Files_SQS_AWS_REGION: Symbol.for('Files_SQS_AWS_REGION'),
  Files_VALET_TOKEN_SECRET: Symbol.for('Files_VALET_TOKEN_SECRET'),
  Files_REDIS_URL: Symbol.for('Files_REDIS_URL'),
  Files_MAX_CHUNK_BYTES: Symbol.for('Files_MAX_CHUNK_BYTES'),
  Files_VERSION: Symbol.for('Files_VERSION'),
  Files_FILE_UPLOAD_PATH: Symbol.for('Files_FILE_UPLOAD_PATH'),
  Files_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING: Symbol.for(
    'Files_IS_CONFIGURED_FOR_HOME_SERVER_OR_SELF_HOSTING',
  ),

  // Handlers
  Files_DomainEventMessageHandler: Symbol.for('Files_DomainEventMessageHandler'),
  Files_DomainEventSubscriberFactory: Symbol.for('Files_DomainEventSubscriberFactory'),
  Files_AccountDeletionRequestedEventHandler: Symbol.for('Files_AccountDeletionRequestedEventHandler'),
  Files_SharedSubscriptionInvitationCanceledEventHandler: Symbol.for(
    'Files_SharedSubscriptionInvitationCanceledEventHandler',
  ),
}

export default TYPES
