import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { SyncResponse20161215 } from './SyncResponse20161215'
import { SyncResponse20200115 } from './SyncResponse20200115'

export interface SyncResponseFactoryInterface {
  createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20161215 | SyncResponse20200115>
}
