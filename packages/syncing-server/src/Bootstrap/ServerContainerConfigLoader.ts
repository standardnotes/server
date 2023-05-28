import { GetGlobalItem } from './../Domain/UseCase/GetGlobalItem/GetGlobalItem'
import { ContactFactory } from './../Domain/Contact/Factory/ContactFactory'

import { VaultServiceInterface } from '../Domain/Vault/Service/VaultServiceInterface'
import { VaultUserFactory } from '../Domain/VaultUser/Factory/VaultUserFactory'
import { VaultFactoryInterface } from '../Domain/Vault/Factory/VaultFactoryInterface'
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
import { TokenEncoder, TokenEncoderInterface, ValetTokenData } from '@standardnotes/security'
import { VaultFactory } from '../Domain/Vault/Factory/VaultFactory'
import { VaultService } from '../Domain/Vault/Service/VaultService'
import { VaultUserService } from '../Domain/VaultUser/Service/VaultUserService'
import { VaultUserServiceInterface } from '../Domain/VaultUser/Service/VaultUserServiceInterface'
import { VaultInviteServiceInterface } from '../Domain/VaultInvite/Service/VaultInviteServiceInterface'
import { VaultInviteService } from '../Domain/VaultInvite/Service/VaultInviteService'
import { VaultInviteFactory } from '../Domain/VaultInvite/Factory/VaultInviteFactory'
import { ContactServiceInterface } from '../Domain/Contact/Service/ContactServiceInterface'
import { ContactService } from '../Domain/Contact/Service/ContactService'
import { ContactFactoryInterface } from '../Domain/Contact/Factory/ContactFactoryInterface'
import { SnjsVersionFilter } from '../Domain/Item/SaveRule/SnjsVersionFilter'
import { CreateVaultFileValetToken } from '../Domain/UseCase/CreateVaultFileValetToken/CreateVaultFileValetToken'

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
        context.container.get(TYPES.VaultService),
        context.container.get(TYPES.VaultInviteService),
        context.container.get(TYPES.ContactService),
      )
    })
    container.bind<CheckIntegrity>(TYPES.CheckIntegrity).toDynamicValue((context: interfaces.Context) => {
      return new CheckIntegrity(context.container.get(TYPES.ItemRepository))
    })
    container.bind<GetItem>(TYPES.GetItem).toDynamicValue((context: interfaces.Context) => {
      return new GetItem(context.container.get(TYPES.ItemRepository))
    })
    container.bind<GetGlobalItem>(TYPES.GetGlobalItem).toDynamicValue((context: interfaces.Context) => {
      return new GetGlobalItem(context.container.get(TYPES.ItemRepository))
    })

    container
      .bind<CreateVaultFileValetToken>(TYPES.CreateVaultFileReadValetToken)
      .toDynamicValue((context: interfaces.Context) => {
        return new CreateVaultFileValetToken(
          context.container.get(TYPES.GetGlobalItem),
          context.container.get(TYPES.VaultService),
          context.container.get(TYPES.VaultUserService),
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
        context.container.get(TYPES.VaultUserRepository),
        context.container.get(TYPES.Logger),
      )
    })
    // Services
    container.bind<VaultServiceInterface>(TYPES.VaultService).toDynamicValue((context: interfaces.Context) => {
      return new VaultService(
        context.container.get(TYPES.VaultRepository),
        context.container.get(TYPES.VaultFactory),
        context.container.get(TYPES.VaultUserService),
        context.container.get(TYPES.VaultInviteService),
        context.container.get(TYPES.Timer),
      )
    })
    container.bind<VaultUserServiceInterface>(TYPES.VaultUserService).toDynamicValue((context: interfaces.Context) => {
      return new VaultUserService(
        context.container.get(TYPES.VaultRepository),
        context.container.get(TYPES.VaultUserRepository),
        context.container.get(TYPES.VaultUserFactory),
        context.container.get(TYPES.Timer),
      )
    })
    container
      .bind<VaultInviteServiceInterface>(TYPES.VaultInviteService)
      .toDynamicValue((context: interfaces.Context) => {
        return new VaultInviteService(
          context.container.get(TYPES.VaultRepository),
          context.container.get(TYPES.VaultInviteRepository),
          context.container.get(TYPES.VaultInviteFactory),
          context.container.get(TYPES.VaultUserService),
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
          context.container.get(TYPES.VaultInviteProjector),
          context.container.get(TYPES.ContactProjector),
          context.container.get(TYPES.VaultProjector),
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
    container.bind<VaultFactoryInterface>(TYPES.VaultFactory).toDynamicValue((context: interfaces.Context) => {
      return new VaultFactory(context.container.get(TYPES.Timer))
    })
    container.bind<VaultUserFactory>(TYPES.VaultUserFactory).toDynamicValue((context: interfaces.Context) => {
      return new VaultUserFactory(context.container.get(TYPES.Timer))
    })
    container.bind<VaultInviteFactory>(TYPES.VaultInviteFactory).toDynamicValue((context: interfaces.Context) => {
      return new VaultInviteFactory(context.container.get(TYPES.Timer))
    })
    container.bind<ContactFactoryInterface>(TYPES.ContactFactory).toDynamicValue((context: interfaces.Context) => {
      return new ContactFactory(context.container.get(TYPES.Timer))
    })

    container
      .bind<OwnershipFilter>(TYPES.OwnershipFilter)
      .toDynamicValue(
        (context: interfaces.Context) =>
          new OwnershipFilter(context.container.get(TYPES.VaultService), context.container.get(TYPES.VaultUserService)),
      )
    container
      .bind<TimeDifferenceFilter>(TYPES.TimeDifferenceFilter)
      .toDynamicValue((context: interfaces.Context) => new TimeDifferenceFilter(context.container.get(TYPES.Timer)))
    container.bind<UuidFilter>(TYPES.UuidFilter).toDynamicValue(() => new UuidFilter())
    container.bind<ContentTypeFilter>(TYPES.ContentTypeFilter).toDynamicValue(() => new ContentTypeFilter())
    container.bind<ContentFilter>(TYPES.ContentFilter).toDynamicValue(() => new ContentFilter())
    container.bind<SnjsVersionFilter>(TYPES.SnjsVersionFilter).toDynamicValue(() => new SnjsVersionFilter())

    container
      .bind<ItemSaveValidatorInterface>(TYPES.ItemSaveValidator)
      .toDynamicValue((context: interfaces.Context) => {
        return new ItemSaveValidator([
          context.container.get(TYPES.SnjsVersionFilter),
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
