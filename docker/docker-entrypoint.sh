#!/bin/bash

# Setup environment variables

printenv | grep API_GATEWAY_ | sed 's/API_GATEWAY_//g' > /opt/server/packages/api-gateway/.env

# Run supervisor

supervisord -c /etc/supervisord.conf

exec "$@"