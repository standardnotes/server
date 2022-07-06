import { BaseKeyParams } from './BaseKeyParams'

export type KeyParamsContent002 = BaseKeyParams & {
  email: string
  pw_cost: number
  pw_salt: string
  pw_nonce: string
}
