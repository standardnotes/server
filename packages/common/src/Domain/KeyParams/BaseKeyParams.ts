import { ProtocolVersion } from '../Protocol/ProtocolVersion'
import { KeyParamsOrigination } from './KeyParamsOrigination'

export type BaseKeyParams = {
  /** Seconds since creation date */
  created?: string
  /** The event that lead to the creation of these params */
  origination?: KeyParamsOrigination
  version: ProtocolVersion
}
