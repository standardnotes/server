import { ApiVersion } from '../../Api/ApiVersion'
import { SyncResponseFactory20161215 } from './SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from './SyncResponseFactory20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SyncResponseFactoryResolverInterface } from './SyncResponseFactoryResolverInterface'

export class SyncResponseFactoryResolver implements SyncResponseFactoryResolverInterface {
  constructor(
    private syncResponseFactory20161215: SyncResponseFactory20161215,
    private syncResponseFactory20200115: SyncResponseFactory20200115,
  ) {}

  resolveSyncResponseFactoryVersion(apiVersion?: string): SyncResponseFactoryInterface {
    switch (apiVersion) {
      case ApiVersion.v20190520:
      case ApiVersion.v20200115:
      case ApiVersion.v20240226:
        return this.syncResponseFactory20200115
      default:
        return this.syncResponseFactory20161215
    }
  }
}
