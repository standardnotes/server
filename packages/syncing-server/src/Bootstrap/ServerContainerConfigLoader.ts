import { ContactFactory } from './../Domain/Contact/Factory/ContactFactory'
import {
  DomainEventHandlerInterface,
  DomainEventMessageHandlerInterface,
  DomainEventSubscriberFactoryInterface,
} from '@standardnotes/domain-events'
import { GroupServiceInterface } from './../Domain/Group/Service/GroupServiceInterface'
import { GroupUserFactory } from '../Domain/GroupUser/Factory/GroupUserFactory'
import { GroupFactoryInterface } from '../Domain/Group/Factory/GroupFactoryInterface'
import { GetSharedItemUseCase } from '../Domain/UseCase/Links/GetSharedItemUseCase'
import { ItemLinkServiceInterface } from '../Domain/ItemLink/Service/ItemLinkServiceInterface'
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
import { ItemLinkService } from '../Domain/ItemLink/Service/ItemLinkService'
import { ItemLinkFactory } from '../Domain/ItemLink/Factory/ItemLinkFactory'
import { ShareItemUseCase } from '../Domain/UseCase/Links/ShareItemUseCase'
import { GetUserItemLinksUseCase } from '../Domain/UseCase/Links/GetUserItemLinksUseCase'
import { TokenEncoder, TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { CreateSharedFileValetToken } from '../Domain/UseCase/CreateSharedFileValetToken/CreateSharedFileValetToken'
import { ItemLinkFactoryInterface } from '../Domain/ItemLink/Factory/ItemLinkFactoryInterface'
import { GroupFactory } from '../Domain/Group/Factory/GroupFactory'
import { GroupService } from '../Domain/Group/Service/GroupService'
import { GroupUserService } from '../Domain/GroupUser/Service/GroupUserService'
import { GroupUserServiceInterface } from '../Domain/GroupUser/Service/GroupUserServiceInterface'
import {
  SQSDomainEventSubscriberFactory,
  SQSEventMessageHandler,
  SQSNewRelicEventMessageHandler,
} from '@standardnotes/domain-events-infra'
import { UserCredentialsChangedEventHandler } from '../Domain/Handler/UserCredentialsChangedEventHandler'
import { GroupInviteServiceInterface } from '../Domain/GroupInvite/Service/GroupInviteServiceInterface'
import { GroupInviteService } from '../Domain/GroupInvite/Service/GroupInviteService'
import { GroupInviteFactory } from '../Domain/GroupInvite/Factory/GroupInviteFactory'
import { ContactServiceInterface } from '../Domain/Contact/Service/ContactServiceInterface'
import { ContactService } from '../Domain/Contact/Service/ContactService'
import { ContactFactoryInterface } from '../Domain/Contact/Factory/ContactFactoryInterface'

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
      return new SyncItems(
        context.container.get(TYPES.ItemService),
        context.container.get(TYPES.GroupService),
        context.container.get(TYPES.GroupInviteService),
        context.container.get(TYPES.ContactService),
      )
    })
    container.bind<CheckIntegrity>(TYPES.CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.ItemRepository))
    })
    container.bind<GetItem>(TYPES.GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.ItemRepository))
    })
    container.bind<ShareItemUseCase>(TYPES.ShareItem).toDynamicValue((context: interfaces.Context) => {
      return new ShareItemUseCase(context.container.get(TYPES.ItemLinkService))
    })
    container.bind<GetSharedItemUseCase>(TYPES.GetSharedItem).toDynamicValue((context: interfaces.Context) => {
      return new GetSharedItemUseCase(context.container.get(TYPES.ItemLinkService))
    })
    container.bind<GetUserItemLinksUseCase>(TYPES.GetUserItemLinks).toDynamicValue((context: interfaces.Context) => {
      return new GetUserItemLinksUseCase(context.container.get(TYPES.ItemLinkService))
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
        context.container.get(TYPES.GroupUserRepository),
        context.container.get(TYPES.Logger),
      )
    })
    // Services
    container.bind<ItemLinkServiceInterface>(TYPES.ItemLinkService).toDynamicValue((context: interfaces.Context) => {
      return new ItemLinkService(
        context.container.get(TYPES.ItemLinkRepository),
        context.container.get(TYPES.ItemLinkFactory),
        context.container.get(TYPES.GetItem),
        context.container.get(TYPES.Timer),
      )
    })
    container.bind<GroupServiceInterface>(TYPES.GroupService).toDynamicValue((context: interfaces.Context) => {
      return new GroupService(
        context.container.get(TYPES.GroupRepository),
        context.container.get(TYPES.GroupFactory),
        context.container.get(TYPES.GroupUserService),
        context.container.get(TYPES.GroupInviteService),
        context.container.get(TYPES.Timer),
      )
    })
    container.bind<GroupUserServiceInterface>(TYPES.GroupUserService).toDynamicValue((context: interfaces.Context) => {
      return new GroupUserService(
        context.container.get(TYPES.GroupRepository),
        context.container.get(TYPES.GroupUserRepository),
        context.container.get(TYPES.GroupUserFactory),
        context.container.get(TYPES.Timer),
      )
    })
    container
      .bind<GroupInviteServiceInterface>(TYPES.GroupInviteService)
      .toDynamicValue((context: interfaces.Context) => {
        return new GroupInviteService(
          context.container.get(TYPES.GroupRepository),
          context.container.get(TYPES.GroupInviteRepository),
          context.container.get(TYPES.GroupInviteFactory),
          context.container.get(TYPES.GroupUserService),
          context.container.get(TYPES.Timer),
        )
      })
    container.bind<ContactServiceInterface>(TYPES.ContactService).toDynamicValue((context: interfaces.Context) => {
      return new ContactService(
        context.container.get(TYPES.ContactRepository),
        context.container.get(TYPES.ContactFactory),
        context.container.get(TYPES.Timer),
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
          context.container.get(TYPES.GroupInviteProjector),
          context.container.get(TYPES.ContactProjector),
          context.container.get(TYPES.GroupProjector),
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
    container.bind<ItemLinkFactoryInterface>(TYPES.ItemLinkFactory).toDynamicValue((context: interfaces.Context) => {
      return new ItemLinkFactory(context.container.get(TYPES.Timer))
    })
    container.bind<GroupFactoryInterface>(TYPES.GroupFactory).toDynamicValue((context: interfaces.Context) => {
      return new GroupFactory(context.container.get(TYPES.Timer))
    })
    container.bind<GroupUserFactory>(TYPES.GroupUserFactory).toDynamicValue((context: interfaces.Context) => {
      return new GroupUserFactory(context.container.get(TYPES.Timer))
    })
    container.bind<GroupInviteFactory>(TYPES.GroupInviteFactory).toDynamicValue((context: interfaces.Context) => {
      return new GroupInviteFactory(context.container.get(TYPES.Timer))
    })
    container.bind<ContactFactoryInterface>(TYPES.ContactFactory).toDynamicValue((context: interfaces.Context) => {
      return new ContactFactory(context.container.get(TYPES.Timer))
    })

    container
      .bind<UserCredentialsChangedEventHandler>(TYPES.UserCredentialsChangedEventHandler)
      .toDynamicValue((context: interfaces.Context) => {
        return new UserCredentialsChangedEventHandler(
          context.container.get(TYPES.ContactRepository),
          context.container.get(TYPES.GroupInviteRepository),
          context.container.get(TYPES.Timer),
        )
      })

    const eventHandlers: Map<string, DomainEventHandlerInterface> = new Map([
      ['USER_CREDENTIALS_CHANGED', container.get(TYPES.UserCredentialsChangedEventHandler)],
    ])

    container
      .bind<DomainEventMessageHandlerInterface>(TYPES.DomainEventMessageHandler)
      .toDynamicValue((context: interfaces.Context) => {
        const env: Env = context.container.get(TYPES.Env)

        const handler =
          env.get('NEW_RELIC_ENABLED', true) === 'true'
            ? new SQSNewRelicEventMessageHandler(eventHandlers, context.container.get(TYPES.Logger))
            : new SQSEventMessageHandler(eventHandlers, context.container.get(TYPES.Logger))

        return handler
      })

    container
      .bind<DomainEventSubscriberFactoryInterface>(TYPES.DomainEventSubscriberFactory)
      .toDynamicValue((context: interfaces.Context) => {
        return new SQSDomainEventSubscriberFactory(
          context.container.get(TYPES.SQS),
          context.container.get(TYPES.SQS_QUEUE_URL),
          context.container.get(TYPES.DomainEventMessageHandler),
        )
      })

    container
      .bind<OwnershipFilter>(TYPES.OwnershipFilter)
      .toDynamicValue(
        (context: interfaces.Context) =>
          new OwnershipFilter(context.container.get(TYPES.GroupService), context.container.get(TYPES.GroupUserService)),
      )
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
