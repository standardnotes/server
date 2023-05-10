export interface ControllerContainerInterface {
  register(methodIdentifier: string, binding: (request: never, response: never) => Promise<unknown>): void
  get(methodIdentifier: string): ((request: never, response: never) => Promise<unknown>) | undefined
}
