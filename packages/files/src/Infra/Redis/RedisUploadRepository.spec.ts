import 'reflect-metadata'

import * as IORedis from 'ioredis'

import { RedisUploadRepository } from './RedisUploadRepository'

describe('RedisUploadRepository', () => {
  let redisClient: IORedis.Redis

  const createRepository = () => new RedisUploadRepository(redisClient)

  beforeEach(() => {
    redisClient = {} as jest.Mocked<IORedis.Redis>
    redisClient.setex = jest.fn()
    redisClient.get = jest.fn().mockReturnValue('123')
    redisClient.lpush = jest.fn()
    redisClient.expire = jest.fn()
    redisClient.lrange = jest.fn().mockReturnValue(['{"tag":"123","chunkId":3}', '{"tag":"123","chunkId":1}'])
  })

  it('should store an upload session', async () => {
    await createRepository().storeUploadSession('1-2-3/2-3-4', '123')

    expect(redisClient.setex).toHaveBeenCalledWith('upload-session:1-2-3/2-3-4', 7200, '123')
  })

  it('should retrieve an upload session id', async () => {
    await createRepository().retrieveUploadSessionId('1-2-3/2-3-4')

    expect(redisClient.get).toHaveBeenCalledWith('upload-session:1-2-3/2-3-4')
  })

  it('should return undefied on an non existing upload session', async () => {
    redisClient.get = jest.fn().mockReturnValue(null)

    expect(await createRepository().retrieveUploadSessionId('1-2-3/2-3-4')).toBeUndefined()
  })

  it('should store and upload chunk result', async () => {
    await createRepository().storeUploadChunkResult('123', { tag: '123', chunkId: 3, chunkSize: 100 })

    expect(redisClient.lpush).toHaveBeenCalledWith('upload-chunks:123', '{"tag":"123","chunkId":3,"chunkSize":100}')
    expect(redisClient.expire).toHaveBeenCalledWith('upload-chunks:123', 7200)
  })

  it('should retrieve upload chunk results', async () => {
    expect(await createRepository().retrieveUploadChunkResults('123')).toEqual([
      {
        tag: '123',
        chunkId: 1,
      },
      {
        tag: '123',
        chunkId: 3,
      },
    ])

    expect(redisClient.lrange).toHaveBeenCalledWith('upload-chunks:123', 0, -1)
  })
})
