import { User } from '../User/User'

export type UpdateUserDTO = {
  [key: string]: string | User | Date | undefined | number
  user: User
  updatedWithUserAgent: string
  apiVersion: string
  email?: string
  pwFunc?: string
  pwAlg?: string
  pwCost?: number
  pwKeySize?: number
  pwNonce?: string
  pwSalt?: string
  kpOrigination?: string
  kpCreated?: Date
  version?: string
}
