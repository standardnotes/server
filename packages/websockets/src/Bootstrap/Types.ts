const TYPES = {
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  SQS: Symbol.for('SQS'),
  // Controller
  WebSocketsController: Symbol.for('WebSocketsController'),
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
  NEW_RELIC_ENABLED: Symbol.for('NEW_RELIC_ENABLED'),
  WEBSOCKETS_API_URL: Symbol.for('WEBSOCKETS_API_URL'),
  VERSION: Symbol.for('VERSION'),
  // use cases
  AddWebSocketsConnection: Symbol.for('AddWebSocketsConnection'),
  RemoveWebSocketsConnection: Symbol.for('RemoveWebSocketsConnection'),
  CreateWebSocketConnectionToken: Symbol.for('CreateWebSocketConnectionToken'),
  // Handlers
  WebSocketMessageRequestedEventHandler: Symbol.for('WebSocketMessageRequestedEventHandler'),
  // Services
  CrossServiceTokenDecoder: Symbol.for('CrossServiceTokenDecoder'),
  WebSocketConnectionTokenEncoder: Symbol.for('WebSocketConnectionTokenEncoder'),
  DomainEventSubscriberFactory: Symbol.for('DomainEventSubscriberFactory'),
  DomainEventMessageHandler: Symbol.for('DomainEventMessageHandler'),
  HTTPClient: Symbol.for('HTTPClient'),
  WebSocketsClientMessenger: Symbol.for('WebSocketsClientMessenger'),
}

export default TYPES
