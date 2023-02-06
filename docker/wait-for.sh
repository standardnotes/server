#!/bin/bash

WAIT_FOR_HOST="$1"
shift
WAIT_FOR_PORT="$1"
shift

while ! nc -vz $WAIT_FOR_HOST $WAIT_FOR_PORT; do
  echo "$WAIT_FOR_HOST:$WAIT_FOR_PORT is unavailable yet - waiting for it to start"
  sleep 10
done

echo "$WAIT_FOR_HOST:$WAIT_FOR_PORT is up. Proceeding to startup."