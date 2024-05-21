// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var auth_pb = require('./auth_pb.js');

function serialize_auth_ConnectionValidationResponse(arg) {
  if (!(arg instanceof auth_pb.ConnectionValidationResponse)) {
    throw new Error('Expected argument of type auth.ConnectionValidationResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_ConnectionValidationResponse(buffer_arg) {
  return auth_pb.ConnectionValidationResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_RequestValidationOptions(arg) {
  if (!(arg instanceof auth_pb.RequestValidationOptions)) {
    throw new Error('Expected argument of type auth.RequestValidationOptions');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_RequestValidationOptions(buffer_arg) {
  return auth_pb.RequestValidationOptions.deserializeBinary(new Uint8Array(buffer_arg));
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

function serialize_auth_WebsocketConnectionAuthorizationHeader(arg) {
  if (!(arg instanceof auth_pb.WebsocketConnectionAuthorizationHeader)) {
    throw new Error('Expected argument of type auth.WebsocketConnectionAuthorizationHeader');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_WebsocketConnectionAuthorizationHeader(buffer_arg) {
  return auth_pb.WebsocketConnectionAuthorizationHeader.deserializeBinary(new Uint8Array(buffer_arg));
}


var AuthService = exports.AuthService = {
  validate: {
    path: '/auth.Auth/validate',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.RequestValidationOptions,
    responseType: auth_pb.SessionValidationResponse,
    requestSerialize: serialize_auth_RequestValidationOptions,
    requestDeserialize: deserialize_auth_RequestValidationOptions,
    responseSerialize: serialize_auth_SessionValidationResponse,
    responseDeserialize: deserialize_auth_SessionValidationResponse,
  },
  validateWebsocket: {
    path: '/auth.Auth/validateWebsocket',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.WebsocketConnectionAuthorizationHeader,
    responseType: auth_pb.ConnectionValidationResponse,
    requestSerialize: serialize_auth_WebsocketConnectionAuthorizationHeader,
    requestDeserialize: deserialize_auth_WebsocketConnectionAuthorizationHeader,
    responseSerialize: serialize_auth_ConnectionValidationResponse,
    responseDeserialize: deserialize_auth_ConnectionValidationResponse,
  },
};

exports.AuthClient = grpc.makeGenericClientConstructor(AuthService);
