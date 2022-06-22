import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'

export interface AuthResponseFactoryResolverInterface {
  resolveAuthResponseFactoryVersion(apiVersion: string): AuthResponseFactoryInterface
}
