import { ApiVersion } from '../Api/ApiVersion'
import { AuthResponseFactoryInterface } from './AuthResponseFactoryInterface'

export interface AuthResponseFactoryResolverInterface {
  resolveAuthResponseFactoryVersion(apiVersion: ApiVersion): AuthResponseFactoryInterface
}
