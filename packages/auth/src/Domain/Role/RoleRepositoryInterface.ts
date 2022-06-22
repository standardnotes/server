import { Role } from './Role'

export interface RoleRepositoryInterface {
  findOneByName(name: string): Promise<Role | null>
}
