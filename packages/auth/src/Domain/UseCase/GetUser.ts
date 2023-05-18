import { inject, injectable } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { UseCaseInterface } from './UseCaseInterface'
import { User } from '../User/User'

@injectable()
export class GetUser implements UseCaseInterface {
  constructor(@inject(TYPES.UserRepository) private userRepository: UserRepositoryInterface) {}

  async execute(dto: { userUuid: string }): Promise<{ user: User | null }> {
    return { user: await this.userRepository.findOneByUuid(dto.userUuid) }
  }
}
