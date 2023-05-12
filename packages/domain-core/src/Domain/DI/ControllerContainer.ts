/* eslint-disable no-console */
import { ControllerContainerInterface } from './ControllerContainerInterface'

export class ControllerContainer implements ControllerContainerInterface {
  private controllerMethodsMap: Map<string, (request: never, response: never) => Promise<unknown>> = new Map()

  register(methodIdentifier: string, binding: (request: never, response: never) => Promise<unknown>): void {
    console.log(`Registering ${methodIdentifier}`)
    this.controllerMethodsMap.set(methodIdentifier, binding)
  }

  get(methodIdentifier: string): ((request: never, response: never) => Promise<unknown>) | undefined {
    console.log(`Getting ${methodIdentifier}. Available methods: ${Array.from(this.controllerMethodsMap.keys())}`)
    return this.controllerMethodsMap.get(methodIdentifier)
  }
}
