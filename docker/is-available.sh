#!/bin/bash

WAIT_FOR_URL="$1"
shift

while ! (curl -s $WAIT_FOR_URL | grep "Welcome"); do
  echo "$WAIT_FOR_URL is unavailable yet - waiting for it to start"
  sleep 10
done

echo "$WAIT_FOR_URL is up. Proceeding to startup."
