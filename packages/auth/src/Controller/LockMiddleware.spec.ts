import 'reflect-metadata'

import { LockMiddleware } from './LockMiddleware'
import { NextFunction, Request, Response } from 'express'
import { User } from '../Domain/User/User'
import { UserRepositoryInterface } from '../Domain/User/UserRepositoryInterface'
import { LockRepositoryInterface } from '../Domain/User/LockRepositoryInterface'

describe('LockMiddleware', () => {
  let userRepository: UserRepositoryInterface
  let lockRepository: LockRepositoryInterface
  let request: Request
  let response: Response
  let user: User
  let next: NextFunction

  const createMiddleware = () => new LockMiddleware(userRepository, lockRepository)

  beforeEach(() => {
    user = {} as jest.Mocked<User>

    lockRepository = {} as jest.Mocked<LockRepositoryInterface>
    lockRepository.isUserLocked = jest.fn().mockReturnValue(true)

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)

    request = {
      body: {
        email: 'test@test.te',
      },
    } as jest.Mocked<Request>
    response = {} as jest.Mocked<Response>
    response.status = jest.fn().mockReturnThis()
    response.send = jest.fn()
    next = jest.fn()
  })

  it('should return locked response if user is locked', async () => {
    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(423)

    expect(next).not.toHaveBeenCalled()
  })

  it('should let the request pass if user is not locked', async () => {
    lockRepository.isUserLocked = jest.fn().mockReturnValue(false)

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalled()
  })

  it('should let the request pass if user is not locked and is identified by username', async () => {
    request.body.username = 'test'

    lockRepository.isUserLocked = jest.fn().mockReturnValue(false)

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalled()
  })

  it('should return locked response if user is not found but the email is locked', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    await createMiddleware().handler(request, response, next)

    expect(response.status).toHaveBeenCalledWith(423)

    expect(next).not.toHaveBeenCalled()
  })

  it('should pass the error to next middleware if one occurres', async () => {
    const error = new Error('Ooops')

    userRepository.findOneByUsernameOrEmail = jest.fn().mockImplementation(() => {
      throw error
    })

    await createMiddleware().handler(request, response, next)

    expect(response.status).not.toHaveBeenCalled()

    expect(next).toHaveBeenCalledWith(error)
  })
})
