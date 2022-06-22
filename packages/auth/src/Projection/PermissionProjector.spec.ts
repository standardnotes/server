import 'reflect-metadata'

import { Permission } from '../Domain/Permission/Permission'

import { PermissionProjector } from './PermissionProjector'

describe('PermissionProjector', () => {
  let permission: Permission

  const createProjector = () => new PermissionProjector()

  beforeEach(() => {
    permission = new Permission()
    permission.uuid = '123'
    permission.name = 'permission1'
    permission.createdAt = new Date(1)
    permission.updatedAt = new Date(2)
  })

  it('should create a simple projection', () => {
    const projection = createProjector().projectSimple(permission)
    expect(projection).toMatchObject({
      uuid: '123',
      name: 'permission1',
    })
  })

  it('should throw error on custom projection', () => {
    let error = null
    try {
      createProjector().projectCustom('test', permission)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })

  it('should throw error on not implemetned full projection', () => {
    let error = null
    try {
      createProjector().projectFull(permission)
    } catch (e) {
      error = e
    }
    expect(error).not.toBeNull()
  })
})
