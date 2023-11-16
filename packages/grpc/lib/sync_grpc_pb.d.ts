// package: sync
// file: sync.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as sync_pb from "./sync_pb";

interface ISyncingService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sync: ISyncingService_Isync;
}

interface ISyncingService_Isync extends grpc.MethodDefinition<sync_pb.SyncRequest, sync_pb.SyncResponse> {
    path: "/sync.Syncing/sync";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<sync_pb.SyncRequest>;
    requestDeserialize: grpc.deserialize<sync_pb.SyncRequest>;
    responseSerialize: grpc.serialize<sync_pb.SyncResponse>;
    responseDeserialize: grpc.deserialize<sync_pb.SyncResponse>;
}

export const SyncingService: ISyncingService;

export interface ISyncingServer {
    sync: grpc.handleUnaryCall<sync_pb.SyncRequest, sync_pb.SyncResponse>;
}

export interface ISyncingClient {
    sync(request: sync_pb.SyncRequest, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
    sync(request: sync_pb.SyncRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
    sync(request: sync_pb.SyncRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
}

export class SyncingClient extends grpc.Client implements ISyncingClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public sync(request: sync_pb.SyncRequest, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
    public sync(request: sync_pb.SyncRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
    public sync(request: sync_pb.SyncRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: sync_pb.SyncResponse) => void): grpc.ClientUnaryCall;
}
