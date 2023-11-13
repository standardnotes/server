#!/bin/bash

PROTO_DEST=./lib

mkdir -p ${PROTO_DEST}

# generate js codes via grpc-tools
yarn run grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:${PROTO_DEST} \
    --grpc_out=${PROTO_DEST} \
    --plugin=protoc-gen-grpc=../../.yarn/unplugged/grpc-tools-npm-1.12.4-956df6794d/node_modules/grpc-tools/bin/protoc_plugin.js \
    -I ./proto \
    proto/*.proto

# generate d.ts codes
yarn run grpc_tools_node_protoc \
    --plugin=protoc-gen-ts=../../.yarn/unplugged/grpc_tools_node_protoc_ts-npm-5.3.3-297a345c26/node_modules/grpc_tools_node_protoc_ts/bin/protoc-gen-ts \
    --ts_out=${PROTO_DEST} \
    -I ./proto \
    proto/*.proto
