import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'

export interface SyncResponseFactoryResolverInterface {
  resolveSyncResponseFactoryVersion(apiVersion?: string): SyncResponseFactoryInterface
}
