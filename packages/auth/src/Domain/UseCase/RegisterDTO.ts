export type RegisterDTO = {
  email: string
  password: string
  updatedWithUserAgent: string
  apiVersion: string
  ephemeralSession: boolean
  pwCost?: number
  pwNonce?: string
  pwSalt?: string
  kpOrigination?: string
  kpCreated?: string
  version?: string
}
