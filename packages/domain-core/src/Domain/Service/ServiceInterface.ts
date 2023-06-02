import { ServiceConfiguration } from './ServiceConfiguration'
import { ServiceIdentifier } from './ServiceIdentifier'

export interface ServiceInterface {
  getContainer(configuration?: ServiceConfiguration): Promise<unknown>
  getId(): ServiceIdentifier
  handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<unknown>
}
