// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var sync_pb = require('./sync_pb.js');

function serialize_sync_SyncRequest(arg) {
  if (!(arg instanceof sync_pb.SyncRequest)) {
    throw new Error('Expected argument of type sync.SyncRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sync_SyncRequest(buffer_arg) {
  return sync_pb.SyncRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sync_SyncResponse(arg) {
  if (!(arg instanceof sync_pb.SyncResponse)) {
    throw new Error('Expected argument of type sync.SyncResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sync_SyncResponse(buffer_arg) {
  return sync_pb.SyncResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SyncingService = exports.SyncingService = {
  syncItems: {
    path: '/sync.Syncing/syncItems',
    requestStream: false,
    responseStream: false,
    requestType: sync_pb.SyncRequest,
    responseType: sync_pb.SyncResponse,
    requestSerialize: serialize_sync_SyncRequest,
    requestDeserialize: deserialize_sync_SyncRequest,
    responseSerialize: serialize_sync_SyncResponse,
    responseDeserialize: deserialize_sync_SyncResponse,
  },
};

exports.SyncingClient = grpc.makeGenericClientConstructor(SyncingService);
