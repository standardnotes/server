import { AuthenticationMethod } from './AuthenticationMethod'

export interface AuthenticationMethodResolverInterface {
  resolve(token: string): Promise<AuthenticationMethod | undefined>
}
