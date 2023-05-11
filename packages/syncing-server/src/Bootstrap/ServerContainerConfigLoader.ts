import { UpdateSharedItemUseCase } from './../Domain/UseCase/ItemShare/UpdateSharedItemUseCase'
import { GetSharedItemUseCase } from './../Domain/UseCase/ItemShare/GetSharedItemUseCase'
import { ItemShareServiceInterface } from './../Domain/ItemShare/ItemShareServiceInterface'
import { Container, interfaces } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { Item } from '../Domain/Item/Item'
import { SyncResponseFactory20161215 } from '../Domain/Item/SyncResponse/SyncResponseFactory20161215'
import { SyncResponseFactory20200115 } from '../Domain/Item/SyncResponse/SyncResponseFactory20200115'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryResolver } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolver'
import { ItemServiceInterface } from '../Domain/Item/ItemServiceInterface'
import { ItemService } from '../Domain/Item/ItemService'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ItemConflictProjector } from '../Projection/ItemConflictProjector'
import { ItemSaveValidatorInterface } from '../Domain/Item/SaveValidator/ItemSaveValidatorInterface'
import { ItemSaveValidator } from '../Domain/Item/SaveValidator/ItemSaveValidator'
import { OwnershipFilter } from '../Domain/Item/SaveRule/OwnershipFilter'
import { TimeDifferenceFilter } from '../Domain/Item/SaveRule/TimeDifferenceFilter'
import { ItemFactoryInterface } from '../Domain/Item/ItemFactoryInterface'
import { ItemFactory } from '../Domain/Item/ItemFactory'
import { UuidFilter } from '../Domain/Item/SaveRule/UuidFilter'
import { ContentTypeFilter } from '../Domain/Item/SaveRule/ContentTypeFilter'
import { ContentFilter } from '../Domain/Item/SaveRule/ContentFilter'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { SavedItemProjection } from '../Projection/SavedItemProjection'
import { SavedItemProjector } from '../Projection/SavedItemProjector'
import { ItemConflict } from '../Domain/Item/ItemConflict'
import { ItemConflictProjection } from '../Projection/ItemConflictProjection'
import { CommonContainerConfigLoader } from './CommonContainerConfigLoader'
import { ItemShareService } from '../Domain/ItemShare/ItemShareService'
import { ItemShareFactoryInterface } from '../Domain/ItemShare/ItemShareFactoryInterface'
import { ItemShareFactory } from '../Domain/ItemShare/ItemShareFactory'
import { ShareItemUseCase } from '../Domain/UseCase/ItemShare/ShareItemUseCase'
import { GetUserItemSharesUseCase } from '../Domain/UseCase/ItemShare/GetUserItemSharesUseCase'
import { TokenEncoder, TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { CreateSharedFileValetToken } from '../Domain/UseCase/CreateSharedFileValetToken/CreateSharedFileValetToken'

export class ServerContainerConfigLoader extends CommonContainerConfigLoader {
  private readonly DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT = 10_000_000
  private readonly DEFAULT_MAX_ITEMS_LIMIT = 300

  override async load(): Promise<Container> {
    const container = await super.load()

    const env: Env = container.get(TYPES.Env)

    // Middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).toDynamicValue((context: interfaces.Context) => {
      return new AuthMiddleware(context.container.get(TYPES.AUTH_JWT_SECRET), context.container.get(TYPES.Logger))
    })

    // Projectors
    container
      .bind<ProjectorInterface<Item, SavedItemProjection>>(TYPES.SavedItemProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new SavedItemProjector(context.container.get(TYPES.Timer))
      })
    container
      .bind<ProjectorInterface<ItemConflict, ItemConflictProjection>>(TYPES.ItemConflictProjector)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemConflictProjector(context.container.get(TYPES.ItemProjector))
      })

    // env vars
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.REVISIONS_FREQUENCY).toConstantValue(env.get('REVISIONS_FREQUENCY'))
    container.bind(TYPES.NEW_RELIC_ENABLED).toConstantValue(env.get('NEW_RELIC_ENABLED', true))
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))
    container.bind(TYPES.VALET_TOKEN_SECRET).toConstantValue(env.get('VALET_TOKEN_SECRET'))
    container.bind(TYPES.VALET_TOKEN_TTL).toConstantValue(+env.get('VALET_TOKEN_TTL', true))
    container
      .bind(TYPES.CONTENT_SIZE_TRANSFER_LIMIT)
      .toConstantValue(
        env.get('CONTENT_SIZE_TRANSFER_LIMIT', true)
          ? +env.get('CONTENT_SIZE_TRANSFER_LIMIT', true)
          : this.DEFAULT_CONTENT_SIZE_TRANSFER_LIMIT,
      )
    container
      .bind(TYPES.MAX_ITEMS_LIMIT)
      .toConstantValue(
        env.get('MAX_ITEMS_LIMIT', true) ? +env.get('MAX_ITEMS_LIMIT', true) : this.DEFAULT_MAX_ITEMS_LIMIT,
      )

    // use cases
    container.bind<SyncItems>(TYPES.SyncItems).toDynamicValue((context: interfaces.Context) => {
      return new SyncItems(context.container.get(TYPES.ItemService))
    })
    container.bind<CheckIntegrity>(TYPES.CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.ItemRepository))
    })
    container.bind<GetItem>(TYPES.GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.ItemRepository))
    })
    container.bind<ShareItemUseCase>(TYPES.ShareItem).toDynamicValue((context: interfaces.Context) => {
      return new ShareItemUseCase(context.container.get(TYPES.ItemShareService))
    })
    container.bind<GetSharedItemUseCase>(TYPES.GetSharedItem).toDynamicValue((context: interfaces.Context) => {
      return new GetSharedItemUseCase(context.container.get(TYPES.ItemShareService))
    })
    container.bind<UpdateSharedItemUseCase>(TYPES.UpdateSharedItem).toDynamicValue((context: interfaces.Context) => {
      return new UpdateSharedItemUseCase(context.container.get(TYPES.ItemShareService))
    })
    container.bind<GetUserItemSharesUseCase>(TYPES.GetUserItemShares).toDynamicValue((context: interfaces.Context) => {
      return new GetUserItemSharesUseCase(context.container.get(TYPES.ItemShareService))
    })
    container
      .bind<CreateSharedFileValetToken>(TYPES.CreateSharedFileValetToken)
      .toDynamicValue((context: interfaces.Context) => {
        return new CreateSharedFileValetToken(
          context.container.get(TYPES.GetSharedItem),
          context.container.get(TYPES.ValetTokenEncoder),
          context.container.get(TYPES.VALET_TOKEN_TTL),
        )
      })

    container
      .bind<TokenEncoderInterface<ValetTokenData>>(TYPES.ValetTokenEncoder)
      .toConstantValue(new TokenEncoder<ValetTokenData>(container.get(TYPES.VALET_TOKEN_SECRET)))

    // Services
    container.bind<ItemServiceInterface>(TYPES.ItemService).toDynamicValue((context: interfaces.Context) => {
      return new ItemService(
        context.container.get(TYPES.ItemSaveValidator),
        context.container.get(TYPES.ItemFactory),
        context.container.get(TYPES.ItemRepository),
        context.container.get(TYPES.DomainEventPublisher),
        context.container.get(TYPES.DomainEventFactory),
        context.container.get(TYPES.REVISIONS_FREQUENCY),
        context.container.get(TYPES.CONTENT_SIZE_TRANSFER_LIMIT),
        context.container.get(TYPES.ItemTransferCalculator),
        context.container.get(TYPES.Timer),
        context.container.get(TYPES.ItemProjector),
        context.container.get(TYPES.MAX_ITEMS_LIMIT),
        context.container.get(TYPES.Logger),
      )
    })
    // Services
    container.bind<ItemShareServiceInterface>(TYPES.ItemShareService).toDynamicValue((context: interfaces.Context) => {
      return new ItemShareService(
        context.container.get(TYPES.ItemShareRepository),
        context.container.get(TYPES.ItemShareFactory),
        context.container.get(TYPES.GetItem),
      )
    })
    container
      .bind<SyncResponseFactory20161215>(TYPES.SyncResponseFactory20161215)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactory20161215(context.container.get(TYPES.ItemProjector))
      })
    container
      .bind<SyncResponseFactory20200115>(TYPES.SyncResponseFactory20200115)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactory20200115(
          context.container.get(TYPES.ItemProjector),
          context.container.get(TYPES.ItemConflictProjector),
          context.container.get(TYPES.SavedItemProjector),
        )
      })
    container
      .bind<SyncResponseFactoryResolverInterface>(TYPES.SyncResponseFactoryResolver)
      .toDynamicValue((context: interfaces.Context) => {
        return new SyncResponseFactoryResolver(
          context.container.get(TYPES.SyncResponseFactory20161215),
          context.container.get(TYPES.SyncResponseFactory20200115),
        )
      })

    container.bind<ItemFactoryInterface>(TYPES.ItemFactory).toDynamicValue((context: interfaces.Context) => {
      return new ItemFactory(context.container.get(TYPES.Timer), context.container.get(TYPES.ItemProjector))
    })
    container.bind<ItemShareFactoryInterface>(TYPES.ItemShareFactory).toDynamicValue((context: interfaces.Context) => {
      return new ItemShareFactory(context.container.get(TYPES.Timer))
    })

    container.bind<OwnershipFilter>(TYPES.OwnershipFilter).toDynamicValue(() => new OwnershipFilter())
    container
      .bind<TimeDifferenceFilter>(TYPES.TimeDifferenceFilter)
      .toDynamicValue((context: interfaces.Context) => new TimeDifferenceFilter(context.container.get(TYPES.Timer)))
    container.bind<UuidFilter>(TYPES.UuidFilter).toDynamicValue(() => new UuidFilter())
    container.bind<ContentTypeFilter>(TYPES.ContentTypeFilter).toDynamicValue(() => new ContentTypeFilter())
    container.bind<ContentFilter>(TYPES.ContentFilter).toDynamicValue(() => new ContentFilter())

    container
      .bind<ItemSaveValidatorInterface>(TYPES.ItemSaveValidator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemSaveValidator([
          context.container.get(TYPES.OwnershipFilter),
          context.container.get(TYPES.TimeDifferenceFilter),
          context.container.get(TYPES.UuidFilter),
          context.container.get(TYPES.ContentTypeFilter),
          context.container.get(TYPES.ContentFilter),
        ])
      })

    return container
  }
}
