#!/bin/bash

WAIT_FOR_URL="$1"
shift
LOGS_PATH="$1"
shift

attempt=0
while [ $attempt -le 120 ]; do
    attempt=$(( $attempt + 1 ))
    echo "# Waiting for all services to be up (attempt: $attempt) ..."
    ping_api_gateway_result=`curl -s $WAIT_FOR_URL | grep "Welcome"`
    if [ "$?" -eq "0" ]; then
        sleep 2 # for warmup
        echo "# All services are up!"
        exit 0
        break
    fi
    sleep 2
done

echo "# Failed to wait for all services to be up!"

echo "# Errors:"
tail $LOGS_PATH/*.err

echo "# Logs:"
tail $LOGS_PATH/*.log

exit 1
