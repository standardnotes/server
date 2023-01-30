#!/bin/bash

SERVICE=$1 && shift 1

if [ "$SERVICE" == "" ]; then
  echo "Please input a service name as parameter"

  exit 1
fi

echo "Bundling and building local docker image for service: $SERVICE"

rm -rf $TMPDIR/bundle-$SERVICE/
mkdir -p $TMPDIR/bundle-$SERVICE

yearn clean

yarn workspace @standardnotes/$SERVICE-server build

yarn workspace @standardnotes/$SERVICE-server bundle --no-compress --output-directory $TMPDIR/bundle-$SERVICE

docker build $TMPDIR/bundle-$SERVICE -f $TMPDIR/bundle-$SERVICE/packages/$SERVICE/Dockerfile -t standardnotes/$SERVICE:local