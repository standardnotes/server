import { ServiceContainerInterface } from './ServiceContainerInterface'
import { ServiceIdentifier } from './ServiceIdentifier'
import { ServiceInterface } from './ServiceInterface'

export class ServiceContainer implements ServiceContainerInterface {
  private serviceMap: Map<string, unknown> = new Map()

  register(serviceIdentifer: ServiceIdentifier, service: ServiceInterface): void {
    this.serviceMap.set(serviceIdentifer.value, service)
  }

  get(serviceIdentifer: ServiceIdentifier): ServiceInterface | undefined {
    return this.serviceMap.get(serviceIdentifer.value) as ServiceInterface
  }
}
