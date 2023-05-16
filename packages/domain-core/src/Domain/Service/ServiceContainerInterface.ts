import { ServiceIdentifier } from './ServiceIdentifier'
import { ServiceInterface } from './ServiceInterface'

export interface ServiceContainerInterface {
  register(serviceIdentifer: ServiceIdentifier, service: ServiceInterface): void
  get(serviceIdentifer: ServiceIdentifier): ServiceInterface | undefined
}
