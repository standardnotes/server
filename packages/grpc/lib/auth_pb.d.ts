// package: auth
// file: auth.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class AuthorizationHeader extends jspb.Message { 
    getBearerToken(): string;
    setBearerToken(value: string): AuthorizationHeader;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AuthorizationHeader.AsObject;
    static toObject(includeInstance: boolean, msg: AuthorizationHeader): AuthorizationHeader.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AuthorizationHeader, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AuthorizationHeader;
    static deserializeBinaryFromReader(message: AuthorizationHeader, reader: jspb.BinaryReader): AuthorizationHeader;
}

export namespace AuthorizationHeader {
    export type AsObject = {
        bearerToken: string,
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
