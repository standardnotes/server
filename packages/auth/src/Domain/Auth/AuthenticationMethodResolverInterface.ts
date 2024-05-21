import { AuthenticationMethod } from './AuthenticationMethod'

export interface AuthenticationMethodResolverInterface {
  resolve(dto: {
    authTokenFromHeaders: string
    authCookies?: Map<string, string[]>
    requestMetadata: {
      url: string
      method: string
      snjs?: string
      application?: string
      userAgent?: string
      secChUa?: string
    }
  }): Promise<AuthenticationMethod | undefined>
}
