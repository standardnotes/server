import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { KeyParamsFactoryInterface } from '../../User/KeyParamsFactoryInterface'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserKeyParamsDTO } from './GetUserKeyParamsDTO'
import { GetUserKeyParamsResponse } from './GetUserKeyParamsResponse'
import { UseCaseInterface } from '../UseCaseInterface'
import { Logger } from 'winston'
import { User } from '../../User/User'
import { PKCERepositoryInterface } from '../../User/PKCERepositoryInterface'
import { GetUserKeyParamsDTOV2Challenged } from './GetUserKeyParamsDTOV2Challenged'
import { KeyParamsData } from '@standardnotes/responses'

@injectable()
export class GetUserKeyParams implements UseCaseInterface {
  constructor(
    @inject(TYPES.KeyParamsFactory) private keyParamsFactory: KeyParamsFactoryInterface,
    @inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.PKCERepository) private pkceRepository: PKCERepositoryInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {}

  async execute(dto: GetUserKeyParamsDTO): Promise<GetUserKeyParamsResponse> {
    if (dto.authenticatedUser) {
      this.logger.debug(`Creating key params for authenticated user ${dto.authenticatedUser.email}`)

      const keyParams = await this.createKeyParams(dto, dto.authenticatedUser, true)

      return {
        keyParams,
      }
    }

    let user: User | null = null
    if (dto.email !== undefined) {
      user = await this.userRepository.findOneByEmail(dto.email)
      if (!user) {
        this.logger.debug(`No user with email ${dto.email}. Creating pseudo key params.`)

        return {
          keyParams: this.keyParamsFactory.createPseudoParams(dto.email),
        }
      }
    } else if (dto.userUuid) {
      user = await this.userRepository.findOneByUuid(dto.userUuid)
    }

    if (!user) {
      this.logger.debug('Could not find user with given parameters: %O', dto)

      throw Error('Could not find user')
    }

    this.logger.debug(`Creating key params for user ${user.email}. Authentication: ${dto.authenticated}`)

    const keyParams = await this.createKeyParams(dto, user, dto.authenticated)

    return {
      keyParams,
    }
  }

  private async createKeyParams(dto: GetUserKeyParamsDTO, user: User, authenticated: boolean): Promise<KeyParamsData> {
    if (this.isCodeChallengedVersion(dto)) {
      await this.pkceRepository.storeCodeChallenge(dto.codeChallenge)
    }

    return this.keyParamsFactory.create(user, authenticated)
  }

  private isCodeChallengedVersion(dto: GetUserKeyParamsDTO): dto is GetUserKeyParamsDTOV2Challenged {
    return (dto as GetUserKeyParamsDTOV2Challenged).codeChallenge !== undefined
  }
}
