import { ControllerContainerInterface } from './ControllerContainerInterface'

export class ControllerContainer implements ControllerContainerInterface {
  private controllerMethodsMap: Map<string, (request: never, response: never) => Promise<unknown>> = new Map()

  register(methodIdentifier: string, binding: (request: never, response: never) => Promise<unknown>): void {
    this.controllerMethodsMap.set(methodIdentifier, binding)
  }

  get(methodIdentifier: string): ((request: never, response: never) => Promise<unknown>) | undefined {
    return this.controllerMethodsMap.get(methodIdentifier)
  }
}
