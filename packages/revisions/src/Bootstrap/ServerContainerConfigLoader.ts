import { Timer, TimerInterface } from '@standardnotes/time'
import { Container, interfaces } from 'inversify'
import { MapperInterface } from '@standardnotes/domain-core'

import TYPES from './Types'
import { RevisionsController } from '../Controller/RevisionsController'
import { GetRevisionsMetada } from '../Domain/UseCase/GetRevisionsMetada/GetRevisionsMetada'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { Revision } from '../Domain/Revision/Revision'
import { GetRevision } from '../Domain/UseCase/GetRevision/GetRevision'
import { DeleteRevision } from '../Domain/UseCase/DeleteRevision/DeleteRevision'
import { RevisionHttpMapper } from '../Mapping/RevisionHttpMapper'
import { RevisionMetadataHttpMapper } from '../Mapping/RevisionMetadataHttpMapper'
import { GetRequiredRoleToViewRevision } from '../Domain/UseCase/GetRequiredRoleToViewRevision/GetRequiredRoleToViewRevision'
import { CommonContainerConfigLoader } from './CommonContainerConfigLoader'
import { ApiGatewayAuthMiddleware } from '../Controller/ApiGatewayAuthMiddleware'
import { CrossServiceTokenData, TokenDecoder, TokenDecoderInterface } from '@standardnotes/security'
import { Env } from './Env'

export class ServerContainerConfigLoader extends CommonContainerConfigLoader {
  override async load(): Promise<Container> {
    const container = await super.load()

    const env: Env = container.get(TYPES.Env)

    container.bind<TimerInterface>(TYPES.Timer).toDynamicValue(() => new Timer())

    container
      .bind<GetRequiredRoleToViewRevision>(TYPES.GetRequiredRoleToViewRevision)
      .toDynamicValue((context: interfaces.Context) => {
        return new GetRequiredRoleToViewRevision(context.container.get(TYPES.Timer))
      })

    // Map
    container
      .bind<
        MapperInterface<
          Revision,
          {
            uuid: string
            item_uuid: string
            content: string | null
            content_type: string
            items_key_id: string | null
            enc_item_key: string | null
            auth_hash: string | null
            created_at: string
            updated_at: string
          }
        >
      >(TYPES.RevisionHttpMapper)
      .toDynamicValue(() => new RevisionHttpMapper())
    container
      .bind<
        MapperInterface<
          RevisionMetadata,
          {
            uuid: string
            content_type: string
            created_at: string
            updated_at: string
          }
        >
      >(TYPES.RevisionMetadataHttpMapper)
      .toDynamicValue((context: interfaces.Context) => {
        return new RevisionMetadataHttpMapper(context.container.get(TYPES.GetRequiredRoleToViewRevision))
      })

    // use cases
    container.bind<GetRevisionsMetada>(TYPES.GetRevisionsMetada).toDynamicValue((context: interfaces.Context) => {
      return new GetRevisionsMetada(context.container.get(TYPES.RevisionRepository))
    })
    container.bind<GetRevision>(TYPES.GetRevision).toDynamicValue((context: interfaces.Context) => {
      return new GetRevision(context.container.get(TYPES.RevisionRepository))
    })
    container.bind<DeleteRevision>(TYPES.DeleteRevision).toDynamicValue((context: interfaces.Context) => {
      return new DeleteRevision(context.container.get(TYPES.RevisionRepository))
    })

    // env vars
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))

    // Controller
    container.bind<RevisionsController>(TYPES.RevisionsController).toDynamicValue((context: interfaces.Context) => {
      return new RevisionsController(
        context.container.get(TYPES.GetRevisionsMetada),
        context.container.get(TYPES.GetRevision),
        context.container.get(TYPES.DeleteRevision),
        context.container.get(TYPES.RevisionHttpMapper),
        context.container.get(TYPES.RevisionMetadataHttpMapper),
        context.container.get(TYPES.Logger),
      )
    })

    container
      .bind<TokenDecoderInterface<CrossServiceTokenData>>(TYPES.CrossServiceTokenDecoder)
      .toDynamicValue((context: interfaces.Context) => {
        return new TokenDecoder<CrossServiceTokenData>(context.container.get(TYPES.AUTH_JWT_SECRET))
      })

    container
      .bind<ApiGatewayAuthMiddleware>(TYPES.ApiGatewayAuthMiddleware)
      .toDynamicValue((context: interfaces.Context) => {
        return new ApiGatewayAuthMiddleware(
          context.container.get(TYPES.CrossServiceTokenDecoder),
          context.container.get(TYPES.Logger),
        )
      })

    return container
  }
}
