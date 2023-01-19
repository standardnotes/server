import { ProtocolVersion } from '@standardnotes/common'

export interface AuthResponse {
  user: {
    uuid: string
    email: string
    protocolVersion: ProtocolVersion
  }
}
