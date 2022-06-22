import * as crypto from 'crypto'
import { KeyParamsData } from '@standardnotes/responses'
import { KeyParamsOrigination, ProtocolVersion } from '@standardnotes/common'

import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { KeyParamsFactoryInterface } from './KeyParamsFactoryInterface'
import { User } from './User'
import { SelectorInterface } from '@standardnotes/auth'

@injectable()
export class KeyParamsFactory implements KeyParamsFactoryInterface {
  constructor(
    @inject(TYPES.PSEUDO_KEY_PARAMS_KEY) private pseudoKeyParamsKey: string,
    @inject(TYPES.ProtocolVersionSelector) private protocolVersionSelector: SelectorInterface<ProtocolVersion>,
  ) {}

  createPseudoParams(email: string): KeyParamsData {
    const versionSelectorHash = crypto
      .createHash('sha256')
      .update(`version-selector-${email}${this.pseudoKeyParamsKey}`)
      .digest('hex')
    const versionsThatAreCompliantWithPseudoParams = [ProtocolVersion.V003, ProtocolVersion.V004]
    const version = this.protocolVersionSelector.select(versionSelectorHash, versionsThatAreCompliantWithPseudoParams)

    return this.sortKeys({
      identifier: email,
      pw_nonce: crypto.createHash('sha256').update(`${email}${this.pseudoKeyParamsKey}`).digest('hex'),
      version,
    })
  }

  create(user: User, authenticated: boolean): KeyParamsData {
    const keyParams: KeyParamsData = {
      version: user.version as ProtocolVersion,
      identifier: user.email,
    }

    switch (user.version) {
      case '004':
        if (authenticated) {
          keyParams.created = user.kpCreated
          keyParams.origination = user.kpOrigination as KeyParamsOrigination
        }
        keyParams.pw_nonce = user.pwNonce
        break
      case '003':
        keyParams.pw_nonce = user.pwNonce
        keyParams.pw_cost = user.pwCost
        break
      case '002':
        keyParams.email = user.email
        keyParams.pw_cost = user.pwCost
        keyParams.pw_salt = user.pwSalt
        break
      case '001':
        keyParams.email = user.email
        keyParams.pw_alg = user.pwAlg
        keyParams.pw_cost = user.pwCost
        keyParams.pw_func = user.pwFunc
        keyParams.pw_salt = user.pwSalt
        keyParams.pw_key_size = user.pwKeySize
        break
    }

    return this.sortKeys(keyParams)
  }

  private sortKeys(keyParams: KeyParamsData): KeyParamsData {
    const sortedKeyParams: { [key: string]: string | number | undefined } = {}

    Object.keys(keyParams)
      .sort()
      .forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sortedKeyParams[key] = (keyParams as any)[key]
      })

    return <KeyParamsData>sortedKeyParams
  }
}
