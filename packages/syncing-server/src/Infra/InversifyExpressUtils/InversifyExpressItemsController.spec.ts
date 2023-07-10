import 'reflect-metadata'

import * as express from 'express'
import { ContentType } from '@standardnotes/common'

import { InversifyExpressItemsController } from './InversifyExpressItemsController'
import { results } from 'inversify-express-utils'
import { Item } from '../../Domain/Item/Item'
import { ItemProjection } from '../../Projection/ItemProjection'
import { ProjectorInterface } from '../../Projection/ProjectorInterface'
import { ApiVersion } from '../../Domain/Api/ApiVersion'
import { SyncResponse20200115 } from '../../Domain/Item/SyncResponse/SyncResponse20200115'
import { SyncResponseFactoryInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponseFactoryResolverInterface } from '../../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../../Domain/UseCase/Syncing/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../../Domain/UseCase/Syncing/GetItem/GetItem'
import { SyncItems } from '../../Domain/UseCase/Syncing/SyncItems/SyncItems'

describe('InversifyExpressItemsController', () => {
  let syncItems: SyncItems
  let checkIntegrity: CheckIntegrity
  let getItem: GetItem
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let request: express.Request
  let response: express.Response
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115

  const createController = () =>
    new InversifyExpressItemsController(syncItems, checkIntegrity, getItem, itemProjector, syncResponceFactoryResolver)

  beforeEach(() => {
    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })

    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

    checkIntegrity = {} as jest.Mocked<CheckIntegrity>
    checkIntegrity.execute = jest.fn().mockReturnValue({ mismatches: [{ uuid: '1-2-3', updated_at_timestamp: 2 }] })

    getItem = {} as jest.Mocked<GetItem>
    getItem.execute = jest.fn().mockReturnValue({ success: true, item: {} as jest.Mocked<Item> })

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    request.body.api = ApiVersion.v20200115
    request.body.sync_token = 'MjoxNjE3MTk1MzQyLjc1ODEyMTc='
    request.body.limit = 150
    request.body.compute_integrity = false
    request.headers['user-agent'] = 'Google Chrome'
    request.body.items = [
      {
        content: 'test',
        content_type: ContentType.Note,
        created_at: '2021-02-19T11:35:45.655Z',
        deleted: false,
        duplicate_of: null,
        enc_item_key: 'test',
        items_key_id: 'test',
        updated_at: '2021-02-19T11:35:45.655Z',
        uuid: '1-2-3',
      },
    ]

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }
    response.locals.freeUser = false

    syncResponse = {} as jest.Mocked<SyncResponse20200115>

    syncResponseFactory = {} as jest.Mocked<SyncResponseFactoryInterface>
    syncResponseFactory.createResponse = jest.fn().mockReturnValue(syncResponse)

    syncResponceFactoryResolver = {} as jest.Mocked<SyncResponseFactoryResolverInterface>
    syncResponceFactoryResolver.resolveSyncResponseFactoryVersion = jest.fn().mockReturnValue(syncResponseFactory)
  })

  it('should get a single item', async () => {
    request.params.uuid = '1-2-3'
    const httpResponse = <results.JsonResult>await createController().getSingleItem(request, response)
    const result = await httpResponse.executeAsync()

    expect(getItem.execute).toHaveBeenCalledWith({
      itemUuid: '1-2-3',
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should return 404 on a missing single item', async () => {
    request.params.uuid = '1-2-3'
    getItem.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.NotFoundResult>await createController().getSingleItem(request, response)
    const result = await httpResponse.executeAsync()

    expect(getItem.execute).toHaveBeenCalledWith({
      itemUuid: '1-2-3',
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(404)
  })

  it('should check items integrity', async () => {
    request.body.integrityPayloads = [
      {
        uuid: '1-2-3',
        updated_at_timestamp: 1,
      },
    ]

    const httpResponse = <results.JsonResult>await createController().checkItemsIntegrity(request, response)
    const result = await httpResponse.executeAsync()

    expect(checkIntegrity.execute).toHaveBeenCalledWith({
      integrityPayloads: [
        {
          updated_at_timestamp: 1,
          uuid: '1-2-3',
        },
      ],
      userUuid: '123',
      freeUser: false,
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"mismatches":[{"uuid":"1-2-3","updated_at_timestamp":2}]}',
    )
  })

  it('should check items integrity with missing request parameter', async () => {
    const httpResponse = <results.JsonResult>await createController().checkItemsIntegrity(request, response)
    const result = await httpResponse.executeAsync()

    expect(checkIntegrity.execute).toHaveBeenCalledWith({
      integrityPayloads: [],
      userUuid: '123',
      freeUser: false,
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"mismatches":[{"uuid":"1-2-3","updated_at_timestamp":2}]}',
    )
  })

  it('should sync items', async () => {
    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      sessionUuid: null,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should sync items with defaulting API version if none specified', async () => {
    delete request.body.api

    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20161215',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      sessionUuid: null,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should sync items with no incoming items in request', async () => {
    response.locals.session = { uuid: '2-3-4' }
    delete request.body.items

    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      sessionUuid: '2-3-4',
    })

    expect(result.statusCode).toEqual(200)
  })
})
