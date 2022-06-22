import 'reflect-metadata'

import { Role } from '../Domain/Role/Role'

import { RoleProjector } from './RoleProjector'

describe('RoleProjector', () => {
  let role: Role

  const createProjector = () => new RoleProjector()

  beforeEach(() => {
    role = new Role()
    role.uuid = '123'
    role.name = 'role1'
    role.createdAt = new Date(1)
    role.updatedAt = new Date(2)
  })

  it('should create a simple projection', () => {
    const projection = createProjector().projectSimple(role)
    expect(projection).toMatchObject({
      uuid: '123',
      name: 'role1',
    })
  })

  it('should throw error on custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom('test', role)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })

  it('should throw error on not implemetned full projection', () => {
    let error = null
    try {
      createProjector().projectFull(role)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })
})
