const TYPES = {
  Logger: Symbol.for('Logger'),
  Timer: Symbol.for('Timer'),
  SQS: Symbol.for('SQS'),
  WebSockets_ApiGatewayManagementApiClient: Symbol.for('WebSockets_ApiGatewayManagementApiClient'),
  // Mappers
  ConnectionPersistenceMapper: Symbol.for('ConnectionPersistenceMapper'),
  // ORM
  ORMConnectionRepository: Symbol.for('ORMConnectionRepository'),
  // Repositories
  WebSocketsConnectionRepository: Symbol.for('WebSocketsConnectionRepository'),
  // Middleware
  ApiGatewayAuthMiddleware: Symbol.for('ApiGatewayAuthMiddleware'),
  // env vars
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  WEB_SOCKET_CONNECTION_TOKEN_SECRET: Symbol.for('WEB_SOCKET_CONNECTION_TOKEN_SECRET'),
  WEB_SOCKET_CONNECTION_TOKEN_TTL: Symbol.for('WEB_SOCKET_CONNECTION_TOKEN_TTL'),
  REDIS_URL: Symbol.for('REDIS_URL'),
  SQS_QUEUE_URL: Symbol.for('SQS_QUEUE_URL'),
  SQS_AWS_REGION: Symbol.for('SQS_AWS_REGION'),
  WEBSOCKETS_API_URL: Symbol.for('WEBSOCKETS_API_URL'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  AddWebSocketsConnection: Symbol.for('AddWebSocketsConnection'),
  RemoveWebSocketsConnection: Symbol.for('RemoveWebSocketsConnection'),
  CreateWebSocketConnectionToken: Symbol.for('CreateWebSocketConnectionToken'),
  SendMessageToClient: Symbol.for('SendMessageToClient'),
  // Handlers
  WebSocketMessageRequestedEventHandler: Symbol.for('WebSocketMessageRequestedEventHandler'),
  // Services
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  WebSocketConnectionTokenEncoder: Symbol.for('WebSocketConnectionTokenEncoder'),
  DomainEventSubscriber: Symbol.for('DomainEventSubscriber'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  WebSocketsClientMessenger: Symbol.for('WebSocketsClientMessenger'),
}

export default TYPES
