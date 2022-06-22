import { Uuid } from '@standardnotes/common'

export interface AuthResponse {
  user: {
    uuid: Uuid
    email: string
  }
}
