// package: sync
// file: sync.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class ItemHashRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): ItemHashRepresentation;
    getUserUuid(): string;
    setUserUuid(value: string): ItemHashRepresentation;

    hasContent(): boolean;
    clearContent(): void;
    getContent(): string | undefined;
    setContent(value: string): ItemHashRepresentation;

    hasContentType(): boolean;
    clearContentType(): void;
    getContentType(): string | undefined;
    setContentType(value: string): ItemHashRepresentation;

    hasDeleted(): boolean;
    clearDeleted(): void;
    getDeleted(): boolean | undefined;
    setDeleted(value: boolean): ItemHashRepresentation;

    hasDuplicateOf(): boolean;
    clearDuplicateOf(): void;
    getDuplicateOf(): string | undefined;
    setDuplicateOf(value: string): ItemHashRepresentation;

    hasAuthHash(): boolean;
    clearAuthHash(): void;
    getAuthHash(): string | undefined;
    setAuthHash(value: string): ItemHashRepresentation;

    hasEncItemKey(): boolean;
    clearEncItemKey(): void;
    getEncItemKey(): string | undefined;
    setEncItemKey(value: string): ItemHashRepresentation;

    hasItemsKeyId(): boolean;
    clearItemsKeyId(): void;
    getItemsKeyId(): string | undefined;
    setItemsKeyId(value: string): ItemHashRepresentation;

    hasKeySystemIdentifier(): boolean;
    clearKeySystemIdentifier(): void;
    getKeySystemIdentifier(): string | undefined;
    setKeySystemIdentifier(value: string): ItemHashRepresentation;

    hasSharedVaultUuid(): boolean;
    clearSharedVaultUuid(): void;
    getSharedVaultUuid(): string | undefined;
    setSharedVaultUuid(value: string): ItemHashRepresentation;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): string | undefined;
    setCreatedAt(value: string): ItemHashRepresentation;

    hasCreatedAtTimestamp(): boolean;
    clearCreatedAtTimestamp(): void;
    getCreatedAtTimestamp(): number | undefined;
    setCreatedAtTimestamp(value: number): ItemHashRepresentation;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): string | undefined;
    setUpdatedAt(value: string): ItemHashRepresentation;

    hasUpdatedAtTimestamp(): boolean;
    clearUpdatedAtTimestamp(): void;
    getUpdatedAtTimestamp(): number | undefined;
    setUpdatedAtTimestamp(value: number): ItemHashRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ItemHashRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: ItemHashRepresentation): ItemHashRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ItemHashRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ItemHashRepresentation;
    static deserializeBinaryFromReader(message: ItemHashRepresentation, reader: jspb.BinaryReader): ItemHashRepresentation;
}

export namespace ItemHashRepresentation {
    export type AsObject = {
        uuid: string,
        userUuid: string,
        content?: string,
        contentType?: string,
        deleted?: boolean,
        duplicateOf?: string,
        authHash?: string,
        encItemKey?: string,
        itemsKeyId?: string,
        keySystemIdentifier?: string,
        sharedVaultUuid?: string,
        createdAt?: string,
        createdAtTimestamp?: number,
        updatedAt?: string,
        updatedAtTimestamp?: number,
    }
}

export class ItemConflictRepresentation extends jspb.Message { 

    hasServerItem(): boolean;
    clearServerItem(): void;
    getServerItem(): ItemRepresentation | undefined;
    setServerItem(value?: ItemRepresentation): ItemConflictRepresentation;

    hasUnsavedItem(): boolean;
    clearUnsavedItem(): void;
    getUnsavedItem(): ItemHashRepresentation | undefined;
    setUnsavedItem(value?: ItemHashRepresentation): ItemConflictRepresentation;
    getType(): string;
    setType(value: string): ItemConflictRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ItemConflictRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: ItemConflictRepresentation): ItemConflictRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ItemConflictRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ItemConflictRepresentation;
    static deserializeBinaryFromReader(message: ItemConflictRepresentation, reader: jspb.BinaryReader): ItemConflictRepresentation;
}

export namespace ItemConflictRepresentation {
    export type AsObject = {
        serverItem?: ItemRepresentation.AsObject,
        unsavedItem?: ItemHashRepresentation.AsObject,
        type: string,
    }
}

export class ItemRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): ItemRepresentation;

    hasItemsKeyId(): boolean;
    clearItemsKeyId(): void;
    getItemsKeyId(): string | undefined;
    setItemsKeyId(value: string): ItemRepresentation;

    hasDuplicateOf(): boolean;
    clearDuplicateOf(): void;
    getDuplicateOf(): string | undefined;
    setDuplicateOf(value: string): ItemRepresentation;

    hasEncItemKey(): boolean;
    clearEncItemKey(): void;
    getEncItemKey(): string | undefined;
    setEncItemKey(value: string): ItemRepresentation;

    hasContent(): boolean;
    clearContent(): void;
    getContent(): string | undefined;
    setContent(value: string): ItemRepresentation;
    getContentType(): string;
    setContentType(value: string): ItemRepresentation;

    hasAuthHash(): boolean;
    clearAuthHash(): void;
    getAuthHash(): string | undefined;
    setAuthHash(value: string): ItemRepresentation;
    getDeleted(): boolean;
    setDeleted(value: boolean): ItemRepresentation;
    getCreatedAt(): string;
    setCreatedAt(value: string): ItemRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): ItemRepresentation;
    getUpdatedAt(): string;
    setUpdatedAt(value: string): ItemRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): ItemRepresentation;

    hasUpdatedWithSession(): boolean;
    clearUpdatedWithSession(): void;
    getUpdatedWithSession(): string | undefined;
    setUpdatedWithSession(value: string): ItemRepresentation;

    hasKeySystemIdentifier(): boolean;
    clearKeySystemIdentifier(): void;
    getKeySystemIdentifier(): string | undefined;
    setKeySystemIdentifier(value: string): ItemRepresentation;

    hasSharedVaultUuid(): boolean;
    clearSharedVaultUuid(): void;
    getSharedVaultUuid(): string | undefined;
    setSharedVaultUuid(value: string): ItemRepresentation;

    hasUserUuid(): boolean;
    clearUserUuid(): void;
    getUserUuid(): string | undefined;
    setUserUuid(value: string): ItemRepresentation;

    hasLastEditedByUuid(): boolean;
    clearLastEditedByUuid(): void;
    getLastEditedByUuid(): string | undefined;
    setLastEditedByUuid(value: string): ItemRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ItemRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: ItemRepresentation): ItemRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ItemRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ItemRepresentation;
    static deserializeBinaryFromReader(message: ItemRepresentation, reader: jspb.BinaryReader): ItemRepresentation;
}

export namespace ItemRepresentation {
    export type AsObject = {
        uuid: string,
        itemsKeyId?: string,
        duplicateOf?: string,
        encItemKey?: string,
        content?: string,
        contentType: string,
        authHash?: string,
        deleted: boolean,
        createdAt: string,
        createdAtTimestamp: number,
        updatedAt: string,
        updatedAtTimestamp: number,
        updatedWithSession?: string,
        keySystemIdentifier?: string,
        sharedVaultUuid?: string,
        userUuid?: string,
        lastEditedByUuid?: string,
    }
}

export class SavedItemRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): SavedItemRepresentation;

    hasDuplicateOf(): boolean;
    clearDuplicateOf(): void;
    getDuplicateOf(): string | undefined;
    setDuplicateOf(value: string): SavedItemRepresentation;
    getContentType(): string;
    setContentType(value: string): SavedItemRepresentation;

    hasAuthHash(): boolean;
    clearAuthHash(): void;
    getAuthHash(): string | undefined;
    setAuthHash(value: string): SavedItemRepresentation;
    getDeleted(): boolean;
    setDeleted(value: boolean): SavedItemRepresentation;
    getCreatedAt(): string;
    setCreatedAt(value: string): SavedItemRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): SavedItemRepresentation;
    getUpdatedAt(): string;
    setUpdatedAt(value: string): SavedItemRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): SavedItemRepresentation;

    hasKeySystemIdentifier(): boolean;
    clearKeySystemIdentifier(): void;
    getKeySystemIdentifier(): string | undefined;
    setKeySystemIdentifier(value: string): SavedItemRepresentation;

    hasSharedVaultUuid(): boolean;
    clearSharedVaultUuid(): void;
    getSharedVaultUuid(): string | undefined;
    setSharedVaultUuid(value: string): SavedItemRepresentation;

    hasUserUuid(): boolean;
    clearUserUuid(): void;
    getUserUuid(): string | undefined;
    setUserUuid(value: string): SavedItemRepresentation;

    hasLastEditedByUuid(): boolean;
    clearLastEditedByUuid(): void;
    getLastEditedByUuid(): string | undefined;
    setLastEditedByUuid(value: string): SavedItemRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SavedItemRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: SavedItemRepresentation): SavedItemRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SavedItemRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SavedItemRepresentation;
    static deserializeBinaryFromReader(message: SavedItemRepresentation, reader: jspb.BinaryReader): SavedItemRepresentation;
}

export namespace SavedItemRepresentation {
    export type AsObject = {
        uuid: string,
        duplicateOf?: string,
        contentType: string,
        authHash?: string,
        deleted: boolean,
        createdAt: string,
        createdAtTimestamp: number,
        updatedAt: string,
        updatedAtTimestamp: number,
        keySystemIdentifier?: string,
        sharedVaultUuid?: string,
        userUuid?: string,
        lastEditedByUuid?: string,
    }
}

export class MessageRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): MessageRepresentation;
    getRecipientUuid(): string;
    setRecipientUuid(value: string): MessageRepresentation;
    getSenderUuid(): string;
    setSenderUuid(value: string): MessageRepresentation;
    getEncryptedMessage(): string;
    setEncryptedMessage(value: string): MessageRepresentation;

    hasReplaceabilityIdentifier(): boolean;
    clearReplaceabilityIdentifier(): void;
    getReplaceabilityIdentifier(): string | undefined;
    setReplaceabilityIdentifier(value: string): MessageRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): MessageRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): MessageRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MessageRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: MessageRepresentation): MessageRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MessageRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MessageRepresentation;
    static deserializeBinaryFromReader(message: MessageRepresentation, reader: jspb.BinaryReader): MessageRepresentation;
}

export namespace MessageRepresentation {
    export type AsObject = {
        uuid: string,
        recipientUuid: string,
        senderUuid: string,
        encryptedMessage: string,
        replaceabilityIdentifier?: string,
        createdAtTimestamp: number,
        updatedAtTimestamp: number,
    }
}

export class SharedVaultRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): SharedVaultRepresentation;
    getUserUuid(): string;
    setUserUuid(value: string): SharedVaultRepresentation;
    getFileUploadBytesUsed(): number;
    setFileUploadBytesUsed(value: number): SharedVaultRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): SharedVaultRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): SharedVaultRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SharedVaultRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: SharedVaultRepresentation): SharedVaultRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SharedVaultRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SharedVaultRepresentation;
    static deserializeBinaryFromReader(message: SharedVaultRepresentation, reader: jspb.BinaryReader): SharedVaultRepresentation;
}

export namespace SharedVaultRepresentation {
    export type AsObject = {
        uuid: string,
        userUuid: string,
        fileUploadBytesUsed: number,
        createdAtTimestamp: number,
        updatedAtTimestamp: number,
    }
}

export class SharedVaultInviteRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): SharedVaultInviteRepresentation;
    getSharedVaultUuid(): string;
    setSharedVaultUuid(value: string): SharedVaultInviteRepresentation;
    getUserUuid(): string;
    setUserUuid(value: string): SharedVaultInviteRepresentation;
    getSenderUuid(): string;
    setSenderUuid(value: string): SharedVaultInviteRepresentation;
    getEncryptedMessage(): string;
    setEncryptedMessage(value: string): SharedVaultInviteRepresentation;
    getPermission(): string;
    setPermission(value: string): SharedVaultInviteRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): SharedVaultInviteRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): SharedVaultInviteRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SharedVaultInviteRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: SharedVaultInviteRepresentation): SharedVaultInviteRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SharedVaultInviteRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SharedVaultInviteRepresentation;
    static deserializeBinaryFromReader(message: SharedVaultInviteRepresentation, reader: jspb.BinaryReader): SharedVaultInviteRepresentation;
}

export namespace SharedVaultInviteRepresentation {
    export type AsObject = {
        uuid: string,
        sharedVaultUuid: string,
        userUuid: string,
        senderUuid: string,
        encryptedMessage: string,
        permission: string,
        createdAtTimestamp: number,
        updatedAtTimestamp: number,
    }
}

export class NotificationRepresentation extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): NotificationRepresentation;
    getUserUuid(): string;
    setUserUuid(value: string): NotificationRepresentation;
    getType(): string;
    setType(value: string): NotificationRepresentation;
    getPayload(): string;
    setPayload(value: string): NotificationRepresentation;
    getCreatedAtTimestamp(): number;
    setCreatedAtTimestamp(value: number): NotificationRepresentation;
    getUpdatedAtTimestamp(): number;
    setUpdatedAtTimestamp(value: number): NotificationRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NotificationRepresentation.AsObject;
    static toObject(includeInstance: boolean, msg: NotificationRepresentation): NotificationRepresentation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NotificationRepresentation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NotificationRepresentation;
    static deserializeBinaryFromReader(message: NotificationRepresentation, reader: jspb.BinaryReader): NotificationRepresentation;
}

export namespace NotificationRepresentation {
    export type AsObject = {
        uuid: string,
        userUuid: string,
        type: string,
        payload: string,
        createdAtTimestamp: number,
        updatedAtTimestamp: number,
    }
}

export class ItemHash extends jspb.Message { 
    getUuid(): string;
    setUuid(value: string): ItemHash;

    hasContent(): boolean;
    clearContent(): void;
    getContent(): string | undefined;
    setContent(value: string): ItemHash;

    hasContentType(): boolean;
    clearContentType(): void;
    getContentType(): string | undefined;
    setContentType(value: string): ItemHash;

    hasDeleted(): boolean;
    clearDeleted(): void;
    getDeleted(): boolean | undefined;
    setDeleted(value: boolean): ItemHash;

    hasDuplicateOf(): boolean;
    clearDuplicateOf(): void;
    getDuplicateOf(): string | undefined;
    setDuplicateOf(value: string): ItemHash;

    hasAuthHash(): boolean;
    clearAuthHash(): void;
    getAuthHash(): string | undefined;
    setAuthHash(value: string): ItemHash;

    hasEncItemKey(): boolean;
    clearEncItemKey(): void;
    getEncItemKey(): string | undefined;
    setEncItemKey(value: string): ItemHash;

    hasItemsKeyId(): boolean;
    clearItemsKeyId(): void;
    getItemsKeyId(): string | undefined;
    setItemsKeyId(value: string): ItemHash;

    hasKeySystemIdentifier(): boolean;
    clearKeySystemIdentifier(): void;
    getKeySystemIdentifier(): string | undefined;
    setKeySystemIdentifier(value: string): ItemHash;

    hasSharedVaultUuid(): boolean;
    clearSharedVaultUuid(): void;
    getSharedVaultUuid(): string | undefined;
    setSharedVaultUuid(value: string): ItemHash;

    hasCreatedAt(): boolean;
    clearCreatedAt(): void;
    getCreatedAt(): string | undefined;
    setCreatedAt(value: string): ItemHash;

    hasCreatedAtTimestamp(): boolean;
    clearCreatedAtTimestamp(): void;
    getCreatedAtTimestamp(): number | undefined;
    setCreatedAtTimestamp(value: number): ItemHash;

    hasUpdatedAt(): boolean;
    clearUpdatedAt(): void;
    getUpdatedAt(): string | undefined;
    setUpdatedAt(value: string): ItemHash;

    hasUpdatedAtTimestamp(): boolean;
    clearUpdatedAtTimestamp(): void;
    getUpdatedAtTimestamp(): number | undefined;
    setUpdatedAtTimestamp(value: number): ItemHash;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ItemHash.AsObject;
    static toObject(includeInstance: boolean, msg: ItemHash): ItemHash.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ItemHash, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ItemHash;
    static deserializeBinaryFromReader(message: ItemHash, reader: jspb.BinaryReader): ItemHash;
}

export namespace ItemHash {
    export type AsObject = {
        uuid: string,
        content?: string,
        contentType?: string,
        deleted?: boolean,
        duplicateOf?: string,
        authHash?: string,
        encItemKey?: string,
        itemsKeyId?: string,
        keySystemIdentifier?: string,
        sharedVaultUuid?: string,
        createdAt?: string,
        createdAtTimestamp?: number,
        updatedAt?: string,
        updatedAtTimestamp?: number,
    }
}

export class SyncResponse extends jspb.Message { 
    clearRetrievedItemsList(): void;
    getRetrievedItemsList(): Array<ItemRepresentation>;
    setRetrievedItemsList(value: Array<ItemRepresentation>): SyncResponse;
    addRetrievedItems(value?: ItemRepresentation, index?: number): ItemRepresentation;
    clearSavedItemsList(): void;
    getSavedItemsList(): Array<SavedItemRepresentation>;
    setSavedItemsList(value: Array<SavedItemRepresentation>): SyncResponse;
    addSavedItems(value?: SavedItemRepresentation, index?: number): SavedItemRepresentation;
    clearConflictsList(): void;
    getConflictsList(): Array<ItemConflictRepresentation>;
    setConflictsList(value: Array<ItemConflictRepresentation>): SyncResponse;
    addConflicts(value?: ItemConflictRepresentation, index?: number): ItemConflictRepresentation;
    getSyncToken(): string;
    setSyncToken(value: string): SyncResponse;

    hasCursorToken(): boolean;
    clearCursorToken(): void;
    getCursorToken(): string | undefined;
    setCursorToken(value: string): SyncResponse;
    clearMessagesList(): void;
    getMessagesList(): Array<MessageRepresentation>;
    setMessagesList(value: Array<MessageRepresentation>): SyncResponse;
    addMessages(value?: MessageRepresentation, index?: number): MessageRepresentation;
    clearSharedVaultsList(): void;
    getSharedVaultsList(): Array<SharedVaultRepresentation>;
    setSharedVaultsList(value: Array<SharedVaultRepresentation>): SyncResponse;
    addSharedVaults(value?: SharedVaultRepresentation, index?: number): SharedVaultRepresentation;
    clearSharedVaultInvitesList(): void;
    getSharedVaultInvitesList(): Array<SharedVaultInviteRepresentation>;
    setSharedVaultInvitesList(value: Array<SharedVaultInviteRepresentation>): SyncResponse;
    addSharedVaultInvites(value?: SharedVaultInviteRepresentation, index?: number): SharedVaultInviteRepresentation;
    clearNotificationsList(): void;
    getNotificationsList(): Array<NotificationRepresentation>;
    setNotificationsList(value: Array<NotificationRepresentation>): SyncResponse;
    addNotifications(value?: NotificationRepresentation, index?: number): NotificationRepresentation;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SyncResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SyncResponse): SyncResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SyncResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SyncResponse;
    static deserializeBinaryFromReader(message: SyncResponse, reader: jspb.BinaryReader): SyncResponse;
}

export namespace SyncResponse {
    export type AsObject = {
        retrievedItemsList: Array<ItemRepresentation.AsObject>,
        savedItemsList: Array<SavedItemRepresentation.AsObject>,
        conflictsList: Array<ItemConflictRepresentation.AsObject>,
        syncToken: string,
        cursorToken?: string,
        messagesList: Array<MessageRepresentation.AsObject>,
        sharedVaultsList: Array<SharedVaultRepresentation.AsObject>,
        sharedVaultInvitesList: Array<SharedVaultInviteRepresentation.AsObject>,
        notificationsList: Array<NotificationRepresentation.AsObject>,
    }
}

export class SyncRequest extends jspb.Message { 
    clearItemsList(): void;
    getItemsList(): Array<ItemHash>;
    setItemsList(value: Array<ItemHash>): SyncRequest;
    addItems(value?: ItemHash, index?: number): ItemHash;
    clearSharedVaultUuidsList(): void;
    getSharedVaultUuidsList(): Array<string>;
    setSharedVaultUuidsList(value: Array<string>): SyncRequest;
    addSharedVaultUuids(value: string, index?: number): string;

    hasComputeIntegrity(): boolean;
    clearComputeIntegrity(): void;
    getComputeIntegrity(): boolean | undefined;
    setComputeIntegrity(value: boolean): SyncRequest;

    hasSyncToken(): boolean;
    clearSyncToken(): void;
    getSyncToken(): string | undefined;
    setSyncToken(value: string): SyncRequest;

    hasCursorToken(): boolean;
    clearCursorToken(): void;
    getCursorToken(): string | undefined;
    setCursorToken(value: string): SyncRequest;

    hasLimit(): boolean;
    clearLimit(): void;
    getLimit(): number | undefined;
    setLimit(value: number): SyncRequest;

    hasContentType(): boolean;
    clearContentType(): void;
    getContentType(): string | undefined;
    setContentType(value: string): SyncRequest;

    hasApiVersion(): boolean;
    clearApiVersion(): void;
    getApiVersion(): string | undefined;
    setApiVersion(value: string): SyncRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SyncRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SyncRequest): SyncRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SyncRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SyncRequest;
    static deserializeBinaryFromReader(message: SyncRequest, reader: jspb.BinaryReader): SyncRequest;
}

export namespace SyncRequest {
    export type AsObject = {
        itemsList: Array<ItemHash.AsObject>,
        sharedVaultUuidsList: Array<string>,
        computeIntegrity?: boolean,
        syncToken?: string,
        cursorToken?: string,
        limit?: number,
        contentType?: string,
        apiVersion?: string,
    }
}
