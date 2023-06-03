import { TimerInterface } from '@standardnotes/time'
import { SharedVaultFactoryInterface } from './SharedVaultFactoryInterface'
import { SharedVaultHash } from './SharedVaultHash'
import { SharedVault } from '../Model/SharedVault'

export class SharedVaultFactory implements SharedVaultFactoryInterface {
  constructor(private timer: TimerInterface) {}

  create(dto: { userUuid: string; sharedVaultHash: SharedVaultHash }): SharedVault {
    const newSharedVault = new SharedVault()
    newSharedVault.uuid = dto.sharedVaultHash.uuid
    newSharedVault.userUuid = dto.userUuid
    newSharedVault.specifiedItemsKeyUuid = dto.sharedVaultHash.specified_items_key_uuid
    newSharedVault.fileUploadBytesUsed = dto.sharedVaultHash.file_upload_bytes_used
    newSharedVault.fileUploadBytesLimit = dto.sharedVaultHash.file_upload_bytes_limit

    const now = this.timer.getTimestampInMicroseconds()
    newSharedVault.updatedAtTimestamp = now
    newSharedVault.createdAtTimestamp = now

    if (dto.sharedVaultHash.created_at_timestamp) {
      newSharedVault.createdAtTimestamp = dto.sharedVaultHash.created_at_timestamp
    }

    return newSharedVault
  }

  createStub(dto: { userUuid: string; sharedVaultHash: SharedVaultHash }): SharedVault {
    const item = this.create(dto)
    return item
  }
}
