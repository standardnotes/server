#!/bin/sh

set -e

host="$1"
shift
port="$1"
shift
cmd="$@"

while ! nc -vz $host $port; do
  >&2 echo "$host:$port is unavailable yet - waiting for it to start"
  sleep 10
done

>&2 echo "$host:$port is up - executing command"
exec $cmd
