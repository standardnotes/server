// package: auth
// file: auth.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as auth_pb from "./auth_pb";

interface IAuthService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    validate: IAuthService_Ivalidate;
    validateWebsocket: IAuthService_IvalidateWebsocket;
}

interface IAuthService_Ivalidate extends grpc.MethodDefinition<auth_pb.AuthorizationHeader, auth_pb.SessionValidationResponse> {
    path: "/auth.Auth/validate";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<auth_pb.AuthorizationHeader>;
    requestDeserialize: grpc.deserialize<auth_pb.AuthorizationHeader>;
    responseSerialize: grpc.serialize<auth_pb.SessionValidationResponse>;
    responseDeserialize: grpc.deserialize<auth_pb.SessionValidationResponse>;
}
interface IAuthService_IvalidateWebsocket extends grpc.MethodDefinition<auth_pb.WebsocketConnectionAuthorizationHeader, auth_pb.ConnectionValidationResponse> {
    path: "/auth.Auth/validateWebsocket";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<auth_pb.WebsocketConnectionAuthorizationHeader>;
    requestDeserialize: grpc.deserialize<auth_pb.WebsocketConnectionAuthorizationHeader>;
    responseSerialize: grpc.serialize<auth_pb.ConnectionValidationResponse>;
    responseDeserialize: grpc.deserialize<auth_pb.ConnectionValidationResponse>;
}

export const AuthService: IAuthService;

export interface IAuthServer {
    validate: grpc.handleUnaryCall<auth_pb.AuthorizationHeader, auth_pb.SessionValidationResponse>;
    validateWebsocket: grpc.handleUnaryCall<auth_pb.WebsocketConnectionAuthorizationHeader, auth_pb.ConnectionValidationResponse>;
}

export interface IAuthClient {
    validate(request: auth_pb.AuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
    validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
    validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
}

export class AuthClient extends grpc.Client implements IAuthClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public validate(request: auth_pb.AuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    public validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    public validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    public validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
    public validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
    public validateWebsocket(request: auth_pb.WebsocketConnectionAuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.ConnectionValidationResponse) => void): grpc.ClientUnaryCall;
}
