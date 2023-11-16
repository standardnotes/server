// package: auth
// file: auth.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as auth_pb from "./auth_pb";

interface ISessionsService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    validate: ISessionsService_Ivalidate;
}

interface ISessionsService_Ivalidate extends grpc.MethodDefinition<auth_pb.AuthorizationHeader, auth_pb.SessionValidationResponse> {
    path: "/auth.Sessions/validate";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<auth_pb.AuthorizationHeader>;
    requestDeserialize: grpc.deserialize<auth_pb.AuthorizationHeader>;
    responseSerialize: grpc.serialize<auth_pb.SessionValidationResponse>;
    responseDeserialize: grpc.deserialize<auth_pb.SessionValidationResponse>;
}

export const SessionsService: ISessionsService;

export interface ISessionsServer {
    validate: grpc.handleUnaryCall<auth_pb.AuthorizationHeader, auth_pb.SessionValidationResponse>;
}

export interface ISessionsClient {
    validate(request: auth_pb.AuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
}

export class SessionsClient extends grpc.Client implements ISessionsClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public validate(request: auth_pb.AuthorizationHeader, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    public validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
    public validate(request: auth_pb.AuthorizationHeader, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: auth_pb.SessionValidationResponse) => void): grpc.ClientUnaryCall;
}
