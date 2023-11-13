// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var auth_pb = require('./auth_pb.js');

function serialize_auth_AuthorizationHeader(arg) {
  if (!(arg instanceof auth_pb.AuthorizationHeader)) {
    throw new Error('Expected argument of type auth.AuthorizationHeader');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_AuthorizationHeader(buffer_arg) {
  return auth_pb.AuthorizationHeader.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_SessionValidationResponse(arg) {
  if (!(arg instanceof auth_pb.SessionValidationResponse)) {
    throw new Error('Expected argument of type auth.SessionValidationResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_SessionValidationResponse(buffer_arg) {
  return auth_pb.SessionValidationResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SessionsService = exports.SessionsService = {
  validate: {
    path: '/auth.Sessions/validate',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.AuthorizationHeader,
    responseType: auth_pb.SessionValidationResponse,
    requestSerialize: serialize_auth_AuthorizationHeader,
    requestDeserialize: deserialize_auth_AuthorizationHeader,
    responseSerialize: serialize_auth_SessionValidationResponse,
    responseDeserialize: deserialize_auth_SessionValidationResponse,
  },
};

exports.SessionsClient = grpc.makeGenericClientConstructor(SessionsService);
