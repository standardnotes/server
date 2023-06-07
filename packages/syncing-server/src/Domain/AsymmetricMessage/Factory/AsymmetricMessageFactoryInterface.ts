import { AsymmetricMessage } from '../Model/AsymmetricMessage'
import { AsymmetricMessageHash } from './AsymmetricMessageHash'

export interface AsymmetricMessageFactoryInterface {
  create(dto: AsymmetricMessageHash): AsymmetricMessage
  createStub(dto: AsymmetricMessageHash): AsymmetricMessage
}
