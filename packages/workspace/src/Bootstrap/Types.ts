const TYPES = {
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SNS: Symbol.for('SNS'),
  SQS: Symbol.for('SQS'),
  // Controller
  WorkspacesController: Symbol.for('WorkspacesController'),
  // Repositories
  WorkspaceRepository: Symbol.for('WorkspaceRepository'),
  WorkspaceUserRepository: Symbol.for('WorkspaceUserRepository'),
  WorkspaceInviteRepository: Symbol.for('WorkspaceInviteRepository'),
  // ORM
  ORMWorkspaceRepository: Symbol.for('ORMWorkspaceRepository'),
  ORMWorkspaceUserRepository: Symbol.for('ORMWorkspaceUserRepository'),
  ORMWorkspaceInviteRepository: Symbol.for('ORMWorkspaceInviteRepository'),
  // Middleware
  ApiGatewayAuthMiddleware: Symbol.for('ApiGatewayAuthMiddleware'),
  // env vars
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  REDIS_URL: Symbol.for('REDIS_URL'),
  SNS_TOPIC_ARN: Symbol.for('SNS_TOPIC_ARN'),
  SNS_AWS_REGION: Symbol.for('SNS_AWS_REGION'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  REDIS_EVENTS_CHANNEL: Symbol.for('REDIS_EVENTS_CHANNEL'),
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  CreateWorkspace: Symbol.for('CreateWorkspace'),
  InviteToWorkspace: Symbol.for('InviteToWorkspace'),
  // Handlers
  UserRegisteredEventHandler: Symbol.for('UserRegisteredEventHandler'),
  // Services
  Timer: Symbol.for('Timer'),
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  DomainEventPublisher: Symbol.for('DomainEventPublisher'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  DomainEventFactory: Symbol.for('DomainEventFactory'),
}

export default TYPES
