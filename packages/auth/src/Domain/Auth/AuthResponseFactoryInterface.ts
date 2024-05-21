import { ApiVersion } from '../Api/ApiVersion'
import { User } from '../User/User'
import { AuthResponseCreationResult } from './AuthResponseCreationResult'

export interface AuthResponseFactoryInterface {
  createResponse(dto: {
    user: User
    apiVersion: ApiVersion
    userAgent: string
    ephemeralSession: boolean
    readonlyAccess: boolean
    snjs?: string
    application?: string
  }): Promise<AuthResponseCreationResult>
}
