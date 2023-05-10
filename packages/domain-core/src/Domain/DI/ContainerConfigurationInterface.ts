import { ServiceContainerInterface } from '../Service/ServiceContainerInterface'

export interface ContainerConfigurationInterface {
  load(serviceContainer?: ServiceContainerInterface): Promise<unknown>
}
