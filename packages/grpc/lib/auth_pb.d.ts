// package: auth
// file: auth.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class Cookie extends jspb.Message { 
    getName(): string;
    setName(value: string): Cookie;
    getValue(): string;
    setValue(value: string): Cookie;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Cookie.AsObject;
    static toObject(includeInstance: boolean, msg: Cookie): Cookie.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Cookie, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Cookie;
    static deserializeBinaryFromReader(message: Cookie, reader: jspb.BinaryReader): Cookie;
}

export namespace Cookie {
    export type AsObject = {
        name: string,
        value: string,
    }
}

export class RequestValidationOptions extends jspb.Message { 
    getBearerToken(): string;
    setBearerToken(value: string): RequestValidationOptions;
    clearCookieList(): void;
    getCookieList(): Array<Cookie>;
    setCookieList(value: Array<Cookie>): RequestValidationOptions;
    addCookie(value?: Cookie, index?: number): Cookie;

    hasSharedVaultOwnerContext(): boolean;
    clearSharedVaultOwnerContext(): void;
    getSharedVaultOwnerContext(): string | undefined;
    setSharedVaultOwnerContext(value: string): RequestValidationOptions;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RequestValidationOptions.AsObject;
    static toObject(includeInstance: boolean, msg: RequestValidationOptions): RequestValidationOptions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RequestValidationOptions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RequestValidationOptions;
    static deserializeBinaryFromReader(message: RequestValidationOptions, reader: jspb.BinaryReader): RequestValidationOptions;
}

export namespace RequestValidationOptions {
    export type AsObject = {
        bearerToken: string,
        cookieList: Array<Cookie.AsObject>,
        sharedVaultOwnerContext?: string,
    }
}

export class SessionValidationResponse extends jspb.Message { 
    getCrossServiceToken(): string;
    setCrossServiceToken(value: string): SessionValidationResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SessionValidationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SessionValidationResponse): SessionValidationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SessionValidationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SessionValidationResponse;
    static deserializeBinaryFromReader(message: SessionValidationResponse, reader: jspb.BinaryReader): SessionValidationResponse;
}

export namespace SessionValidationResponse {
    export type AsObject = {
        crossServiceToken: string,
    }
}

export class WebsocketConnectionAuthorizationHeader extends jspb.Message { 
    getToken(): string;
    setToken(value: string): WebsocketConnectionAuthorizationHeader;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): WebsocketConnectionAuthorizationHeader.AsObject;
    static toObject(includeInstance: boolean, msg: WebsocketConnectionAuthorizationHeader): WebsocketConnectionAuthorizationHeader.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: WebsocketConnectionAuthorizationHeader, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): WebsocketConnectionAuthorizationHeader;
    static deserializeBinaryFromReader(message: WebsocketConnectionAuthorizationHeader, reader: jspb.BinaryReader): WebsocketConnectionAuthorizationHeader;
}

export namespace WebsocketConnectionAuthorizationHeader {
    export type AsObject = {
        token: string,
    }
}

export class ConnectionValidationResponse extends jspb.Message { 
    getCrossServiceToken(): string;
    setCrossServiceToken(value: string): ConnectionValidationResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConnectionValidationResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ConnectionValidationResponse): ConnectionValidationResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConnectionValidationResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConnectionValidationResponse;
    static deserializeBinaryFromReader(message: ConnectionValidationResponse, reader: jspb.BinaryReader): ConnectionValidationResponse;
}

export namespace ConnectionValidationResponse {
    export type AsObject = {
        crossServiceToken: string,
    }
}
