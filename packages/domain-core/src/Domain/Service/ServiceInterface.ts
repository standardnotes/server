import { ServiceIdentifier } from './ServiceIdentifier'

export interface ServiceInterface {
  getContainer(): Promise<unknown>
  getId(): ServiceIdentifier
  handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<unknown>
}
