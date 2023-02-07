#!/bin/bash

WAIT_FOR_URL="$1"
shift

attempt=0
while [ $attempt -le 180 ]; do
    attempt=$(( $attempt + 1 ))
    echo "# Waiting for all services to be up (attempt: $attempt) ..."
    ping_api_gateway_result=`curl -s $WAIT_FOR_URL | grep "Welcome"`
    if [ "$?" -eq "0" ]; then
        sleep 2 # for warmup
        echo "# All services are up!"
        break
    fi
    sleep 2
done
