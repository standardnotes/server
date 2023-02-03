#!/bin/bash

# Setup environment variables

printenv | grep API_GATEWAY_ | sed 's/API_GATEWAY_//g' > /opt/server/packages/api-gateway/.env
printenv | grep AUTH_SERVER_ | sed 's/AUTH_SERVER_//g' > /opt/server/packages/auth/.env

# Run supervisor

supervisord -c /etc/supervisord.conf

exec "$@"