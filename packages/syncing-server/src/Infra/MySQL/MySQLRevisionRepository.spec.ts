import 'reflect-metadata'

import { Repository, SelectQueryBuilder } from 'typeorm'
import { Revision } from '../../Domain/Revision/Revision'
import { MySQLRevisionRepository } from './MySQLRevisionRepository'

describe('MySQLRevisionRepository', () => {
  let ormRepository: Repository<Revision>
  let queryBuilder: SelectQueryBuilder<Revision>
  let revision: Revision

  const createRepository = () => new MySQLRevisionRepository(ormRepository)

  beforeEach(() => {
    queryBuilder = {} as jest.Mocked<SelectQueryBuilder<Revision>>

    revision = {} as jest.Mocked<Revision>

    ormRepository = {} as jest.Mocked<Repository<Revision>>
    ormRepository.save = jest.fn()
    ormRepository.createQueryBuilder = jest.fn().mockImplementation(() => queryBuilder)
  })

  it('should save', async () => {
    await createRepository().save(revision)

    expect(ormRepository.save).toHaveBeenCalledWith(revision)
  })

  it('should delete a revision for an item', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.delete = jest.fn().mockReturnThis()
    queryBuilder.from = jest.fn().mockReturnThis()
    queryBuilder.execute = jest.fn()

    await createRepository().removeByUuid('1-2-3', '3-4-5')

    expect(queryBuilder.delete).toHaveBeenCalled()

    expect(queryBuilder.from).toHaveBeenCalledWith('revisions')
    expect(queryBuilder.where).toHaveBeenCalledWith('uuid = :revisionUuid AND item_uuid = :itemUuid', {
      itemUuid: '1-2-3',
      revisionUuid: '3-4-5',
    })

    expect(queryBuilder.execute).toHaveBeenCalled()
  })

  it('should find revisions by item id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([revision])

    const result = await createRepository().findByItemId({ itemUuid: '123' })

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('revision.created_at', 'DESC')
    expect(result).toEqual([revision])
  })

  it('should find revisions by item id after certain date', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.andWhere = jest.fn().mockReturnThis()
    queryBuilder.orderBy = jest.fn().mockReturnThis()
    queryBuilder.getMany = jest.fn().mockReturnValue([revision])

    const result = await createRepository().findByItemId({ itemUuid: '123', afterDate: new Date(2) })

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.item_uuid = :item_uuid', { item_uuid: '123' })
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('revision.creation_date >= :after_date', {
      after_date: new Date(2),
    })
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('revision.created_at', 'DESC')
    expect(result).toEqual([revision])
  })

  it('should find one revision by id and item id', async () => {
    queryBuilder.where = jest.fn().mockReturnThis()
    queryBuilder.getOne = jest.fn().mockReturnValue(revision)

    const result = await createRepository().findOneById('123', '234')

    expect(queryBuilder.where).toHaveBeenCalledWith('revision.uuid = :uuid AND revision.item_uuid = :item_uuid', {
      uuid: '234',
      item_uuid: '123',
    })
    expect(result).toEqual(revision)
  })
})
