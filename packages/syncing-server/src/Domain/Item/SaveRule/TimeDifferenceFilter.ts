import { Time, TimerInterface } from '@standardnotes/time'

import { ApiVersion } from '../../Api/ApiVersion'
import { ItemHash } from '../ItemHash'
import { ItemSaveValidationDTO } from '../SaveValidator/ItemSaveValidationDTO'
import { ItemSaveRuleResult } from './ItemSaveRuleResult'
import { ItemSaveRuleInterface } from './ItemSaveRuleInterface'
import { ConflictType } from '@standardnotes/responses'

export class TimeDifferenceFilter implements ItemSaveRuleInterface {
  constructor(private timer: TimerInterface) {}

  async check(dto: ItemSaveValidationDTO): Promise<ItemSaveRuleResult> {
    if (!dto.existingItem) {
      return {
        passed: true,
      }
    }

    let incomingUpdatedAtTimestamp = dto.itemHash.props.updated_at_timestamp
    if (incomingUpdatedAtTimestamp === undefined) {
      incomingUpdatedAtTimestamp =
        dto.itemHash.props.updated_at !== undefined
          ? this.timer.convertStringDateToMicroseconds(dto.itemHash.props.updated_at)
          : this.timer.convertStringDateToMicroseconds(new Date(0).toString())
    }

    if (this.itemWasSentFromALegacyClient(incomingUpdatedAtTimestamp, dto.apiVersion)) {
      return {
        passed: true,
      }
    }

    const ourUpdatedAtTimestamp = dto.existingItem.props.timestamps.updatedAt
    const difference = incomingUpdatedAtTimestamp - ourUpdatedAtTimestamp

    if (this.itemHashHasMicrosecondsPrecision(dto.itemHash)) {
      const passed = difference === 0

      return {
        passed,
        conflict: passed
          ? undefined
          : {
              serverItem: dto.existingItem,
              type: ConflictType.ConflictingData,
            },
      }
    }

    const passed = Math.abs(difference) < this.getMinimalConflictIntervalMicroseconds(dto.apiVersion)

    return {
      passed,
      conflict: passed
        ? undefined
        : {
            serverItem: dto.existingItem,
            type: ConflictType.ConflictingData,
          },
    }
  }

  private itemWasSentFromALegacyClient(incomingUpdatedAtTimestamp: number, apiVersion: string) {
    return incomingUpdatedAtTimestamp === 0 && apiVersion === ApiVersion.v20161215
  }

  private itemHashHasMicrosecondsPrecision(itemHash: ItemHash) {
    return itemHash.props.updated_at_timestamp !== undefined
  }

  private getMinimalConflictIntervalMicroseconds(apiVersion?: string): number {
    switch (apiVersion) {
      case ApiVersion.v20161215:
        return Time.MicrosecondsInASecond
      default:
        return Time.MicrosecondsInAMillisecond
    }
  }
}
