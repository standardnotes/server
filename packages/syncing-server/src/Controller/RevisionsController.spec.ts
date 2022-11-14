import 'reflect-metadata'

import { Revision } from '../Domain/Revision/Revision'
import * as express from 'express'

import { RevisionsController } from './RevisionsController'
import { results } from 'inversify-express-utils'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { RevisionServiceInterface } from '../Domain/Revision/RevisionServiceInterface'
import { RevisionProjection } from '../Projection/RevisionProjection'
import { MapInterface } from '@standardnotes/domain-core'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { SimpleRevisionProjection } from '../Projection/SimpleRevisionProjection'

describe('RevisionsController', () => {
  let revisionProjector: ProjectorInterface<Revision, RevisionProjection>
  let revisionMap: MapInterface<RevisionMetadata, SimpleRevisionProjection>
  let revisionService: RevisionServiceInterface
  let revision: Revision
  let revisionMetadata: RevisionMetadata
  let request: express.Request
  let response: express.Response

  const createController = () => new RevisionsController(revisionService, revisionProjector, revisionMap)

  beforeEach(() => {
    revision = {} as jest.Mocked<Revision>

    revisionMetadata = {} as jest.Mocked<RevisionMetadata>

    revisionMap = {} as jest.Mocked<MapInterface<RevisionMetadata, SimpleRevisionProjection>>

    revisionProjector = {} as jest.Mocked<ProjectorInterface<Revision, RevisionProjection>>

    revisionService = {} as jest.Mocked<RevisionServiceInterface>
    revisionService.getRevisionsMetadata = jest.fn().mockReturnValue([revisionMetadata])
    revisionService.getRevision = jest.fn().mockReturnValue(revision)
    revisionService.removeRevision = jest.fn().mockReturnValue(true)

    request = {
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }
    response.locals.roleNames = ['BASIC_USER']
  })

  it('should return revisions for an item', async () => {
    revisionMap.toProjection = jest.fn().mockReturnValue({ foo: 'bar' })

    const revisionResponse = await createController().getRevisions(request, response)

    expect(revisionResponse.json).toEqual([{ foo: 'bar' }])
  })

  it('should return a specific revision for an item', async () => {
    revisionProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })

    const httpResponse = <results.JsonResult>await createController().getRevision(request, response)

    expect(httpResponse.json).toEqual({ foo: 'bar' })
  })

  it('should remove a specific revision for an item', async () => {
    const httpResponse = await createController().deleteRevision(request, response)

    expect(httpResponse).toBeInstanceOf(results.OkResult)
  })

  it('should not remove a specific revision for an item if it fails', async () => {
    revisionService.removeRevision = jest.fn().mockReturnValue(false)

    const httpResponse = await createController().deleteRevision(request, response)

    expect(httpResponse).toBeInstanceOf(results.BadRequestResult)
  })

  it('should not remove a specific revision for an item the session is read only', async () => {
    response.locals.readOnlyAccess = true

    const httpResponse = await createController().deleteRevision(request, response)
    const result = await httpResponse.executeAsync()

    expect(result.statusCode).toEqual(401)
  })

  it('should return a 404 for a not found specific revision in an item', async () => {
    revisionService.getRevision = jest.fn().mockReturnValue(null)

    const httpResponse = await createController().getRevision(request, response)

    expect(httpResponse).toBeInstanceOf(results.NotFoundResult)
  })
})
