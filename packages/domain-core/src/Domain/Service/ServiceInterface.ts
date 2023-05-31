import { ServiceIdentifier } from './ServiceIdentifier'
import { Transform } from 'stream'

export interface ServiceInterface {
  getContainer(): Promise<unknown>
  setLogger(logger: Transform): void
  getId(): ServiceIdentifier
  handleRequest(request: never, response: never, endpointOrMethodIdentifier: string): Promise<unknown>
}
