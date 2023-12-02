#!/bin/bash

# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
		exit 1
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

# Setup environment variables

export MODE="self-hosted"

#########
# PORTS #
#########

export API_GATEWAY_PORT=3000

if [ -z "$SYNCING_SERVER_PORT" ]; then
  export SYNCING_SERVER_PORT=3101
fi

if [ -z "$SYNCING_SERVER_GRPC_PORT" ]; then
  export SYNCING_SERVER_GRPC_PORT=50052
fi

if [ -z "$AUTH_SERVER_PORT" ]; then
  export AUTH_SERVER_PORT=3103
fi

if [ -z "$AUTH_SERVER_GRPC_PORT" ]; then
  export AUTH_SERVER_GRPC_PORT=50051
fi

export FILES_SERVER_PORT=3104

if [ -z "$REVISIONS_SERVER_PORT" ]; then
  export REVISIONS_SERVER_PORT=3105
fi

######
# DB #
######

if [ -z "$DB_HOST" ]; then
  echo "DB_HOST is not set. Please set it in your .env file."
  exit 1
fi
if [ -z "$DB_PORT" ]; then
  echo "DB_PORT is not set. Please set it in your .env file."
  exit 1
fi
file_env 'DB_USERNAME'
if [ -z "$DB_USERNAME" ]; then
  echo "DB_USERNAME is not set. Please set it in your .env file."
  exit 1
fi
file_env 'DB_PASSWORD'
if [ -z "$DB_PASSWORD" ]; then
  echo "DB_PASSWORD is not set. Please set it in your .env file."
  exit 1
fi
if [ -z "$DB_DATABASE" ]; then
  echo "DB_DATABASE is not set. Please set it in your .env file."
  exit 1
fi
if [ -z "$DB_DEBUG_LEVEL" ]; then
  export DB_DEBUG_LEVEL="all"
fi
if [ -z "$DB_TYPE" ]; then
  export DB_TYPE="mysql"
fi
if [ -z "$CACHE_TYPE" ]; then
  export CACHE_TYPE="redis"
fi
export DB_MIGRATIONS_PATH="dist/migrations/*.js"

#########
# CACHE #
#########

if [ -z "$REDIS_PORT" ]; then
  echo "REDIS_PORT is not set. Please set it in your .env file."
  exit 1
fi

if [ -z "$REDIS_HOST" ]; then
  echo "REDIS_HOST is not set. Please set it in your .env file."
  exit 1
fi

if [ -z "$REDIS_URL" ]; then
  export REDIS_URL="redis://$REDIS_HOST"
fi

##########
# SHARED #
##########

file_env 'AUTH_JWT_SECRET'
if [ -z "$AUTH_JWT_SECRET" ]; then
  echo "AUTH_JWT_SECRET is not set. Please set it in your .env file. You can run 'openssl rand -hex 32' to generate a random string."
  exit 1
fi

file_env 'VALET_TOKEN_SECRET'
if [ -z "$VALET_TOKEN_SECRET" ]; then
  echo "VALET_TOKEN_SECRET is not set. Please set it in your .env file. You can run 'openssl rand -hex 32' to generate a random string."
  exit 1
fi

########
# AUTH #
########

if [ -z "$AUTH_SERVER_LOG_LEVEL" ]; then
  export AUTH_SERVER_LOG_LEVEL="info"
fi
export AUTH_SERVER_NODE_ENV="production"
export AUTH_SERVER_VERSION="local"

if [ -z "$AUTH_SERVER_AUTH_JWT_TTL" ]; then
  export AUTH_SERVER_AUTH_JWT_TTL=60000
fi

export AUTH_SERVER_JWT_SECRET=$AUTH_JWT_SECRET
export AUTH_SERVER_LEGACY_JWT_SECRET=$(openssl rand -hex 32)

if [ -z "$AUTH_SERVER_DISABLE_USER_REGISTRATION" ]; then
  export AUTH_SERVER_DISABLE_USER_REGISTRATION=false
fi

file_env 'AUTH_SERVER_PSEUDO_KEY_PARAMS_KEY'
if [ -z "$AUTH_SERVER_PSEUDO_KEY_PARAMS_KEY" ]; then
  export AUTH_SERVER_PSEUDO_KEY_PARAMS_KEY=$(openssl rand -hex 32)
fi

if [ -z "$AUTH_SERVER_ACCESS_TOKEN_AGE" ]; then
  export AUTH_SERVER_ACCESS_TOKEN_AGE=5184000
fi
if [ -z "$AUTH_SERVER_REFRESH_TOKEN_AGE" ]; then
  export AUTH_SERVER_REFRESH_TOKEN_AGE=31556926
fi

if [ -z "$AUTH_SERVER_MAX_LOGIN_ATTEMPTS" ]; then
  export AUTH_SERVER_MAX_LOGIN_ATTEMPTS=6
fi
if [ -z "$AUTH_SERVER_FAILED_LOGIN_LOCKOUT" ]; then
  export AUTH_SERVER_FAILED_LOGIN_LOCKOUT=3600
fi

if [ -z "$AUTH_SERVER_EPHEMERAL_SESSION_AGE" ]; then
  export AUTH_SERVER_EPHEMERAL_SESSION_AGE=259200
fi

file_env 'AUTH_SERVER_ENCRYPTION_SERVER_KEY'
if [ -z "$AUTH_SERVER_ENCRYPTION_SERVER_KEY" ]; then
  echo "AUTH_SERVER_ENCRYPTION_SERVER_KEY is not set. Please set it in your .env file. You can run 'openssl rand -hex 32' to generate a random string."
  exit 1
fi

export AUTH_SERVER_SYNCING_SERVER_URL=http://localhost:$SYNCING_SERVER_PORT

# File Uploads
if [ -z "$AUTH_SERVER_VALET_TOKEN_TTL" ]; then
  export AUTH_SERVER_VALET_TOKEN_TTL=7200
fi

# Localstack Setup
if [ -z "$AUTH_SERVER_SNS_TOPIC_ARN" ]; then
  export AUTH_SERVER_SNS_TOPIC_ARN="arn:aws:sns:us-east-1:000000000000:auth-local-topic"
fi
if [ -z "$AUTH_SERVER_SNS_ENDPOINT" ]; then
  export AUTH_SERVER_SNS_ENDPOINT="http://localstack:4566"
fi
file_env 'AUTH_SERVER_SNS_SECRET_ACCESS_KEY'
if [ -z "$AUTH_SERVER_SNS_SECRET_ACCESS_KEY" ]; then
  export AUTH_SERVER_SNS_SECRET_ACCESS_KEY="x"
fi
file_env 'AUTH_SERVER_SNS_ACCESS_KEY_ID'
if [ -z "$AUTH_SERVER_SNS_ACCESS_KEY_ID" ]; then
  export AUTH_SERVER_SNS_ACCESS_KEY_ID="x"
fi
if [ -z "$AUTH_SERVER_SNS_AWS_REGION" ]; then
  export AUTH_SERVER_SNS_AWS_REGION="us-east-1"
fi
if [ -z "$AUTH_SERVER_SQS_QUEUE_URL" ]; then
  export AUTH_SERVER_SQS_QUEUE_URL="http://localstack:4566/000000000000/auth-local-queue"
fi
if [ -z "$AUTH_SERVER_SQS_AWS_REGION" ]; then
  export AUTH_SERVER_SQS_AWS_REGION="us-east-1"
fi
file_env 'AUTH_SERVER_SQS_ACCESS_KEY_ID'
if [ -z "$AUTH_SERVER_SQS_ACCESS_KEY_ID" ]; then
  export AUTH_SERVER_SQS_ACCESS_KEY_ID="x"
fi
file_env 'AUTH_SERVER_SQS_SECRET_ACCESS_KEY'
if [ -z "$AUTH_SERVER_SQS_SECRET_ACCESS_KEY" ]; then
  export AUTH_SERVER_SQS_SECRET_ACCESS_KEY="x"
fi
if [ -z "$AUTH_SERVER_SQS_ENDPOINT" ]; then
  export AUTH_SERVER_SQS_ENDPOINT="http://localstack:4566"
fi

# U2F Setup
if [ -z "$AUTH_SERVER_U2F_RELYING_PARTY_ID" ]; then
  export AUTH_SERVER_U2F_RELYING_PARTY_ID="localhost"
fi
if [ -z "$AUTH_SERVER_U2F_RELYING_PARTY_NAME" ]; then
  export AUTH_SERVER_U2F_RELYING_PARTY_NAME="Standard Notes"
fi
if [ -z "$AUTH_SERVER_U2F_EXPECTED_ORIGIN" ]; then
  export AUTH_SERVER_U2F_EXPECTED_ORIGIN="http://localhost,http://localhost:3001,https://app.standardnotes.com,android:apk-key-hash:WD_EG0kMOAtW--nuRzgetO9T4DcZpVA_wfKdzY4okCo"
fi
if [ -z "$AUTH_SERVER_U2F_REQUIRE_USER_VERIFICATION" ]; then
  export AUTH_SERVER_U2F_REQUIRE_USER_VERIFICATION=false
fi

printenv | grep AUTH_SERVER_ | sed 's/AUTH_SERVER_//g' > /opt/server/packages/auth/.env

##################
# SYNCING SERVER #
##################

if [ -z "$SYNCING_SERVER_LOG_LEVEL" ]; then
  export SYNCING_SERVER_LOG_LEVEL="info"
fi
export SYNCING_SERVER_NODE_ENV=production
export SYNCING_SERVER_VERSION=local

if [ -z "$SYNCING_SERVER_SNS_TOPIC_ARN" ]; then
  export SYNCING_SERVER_SNS_TOPIC_ARN="arn:aws:sns:us-east-1:000000000000:syncing-server-local-topic"
fi
if [ -z "$SYNCING_SERVER_SNS_ENDPOINT" ]; then
  export SYNCING_SERVER_SNS_ENDPOINT="http://localstack:4566"
fi
file_env 'SYNCING_SERVER_SNS_SECRET_ACCESS_KEY'
if [ -z "$SYNCING_SERVER_SNS_SECRET_ACCESS_KEY" ]; then
  export SYNCING_SERVER_SNS_SECRET_ACCESS_KEY="x"
fi
file_env 'SYNCING_SERVER_SNS_ACCESS_KEY_ID'
if [ -z "$SYNCING_SERVER_SNS_ACCESS_KEY_ID" ]; then
  export SYNCING_SERVER_SNS_ACCESS_KEY_ID="x"
fi
if [ -z "$SYNCING_SERVER_SNS_AWS_REGION" ]; then
  export SYNCING_SERVER_SNS_AWS_REGION="us-east-1"
fi
if [ -z "$SYNCING_SERVER_SQS_QUEUE_URL" ]; then
  export SYNCING_SERVER_SQS_QUEUE_URL="http://localstack:4566/000000000000/syncing-server-local-queue"
fi
if [ -z "$SYNCING_SERVER_SQS_AWS_REGION" ]; then
  export SYNCING_SERVER_SQS_AWS_REGION="us-east-1"
fi
file_env 'SYNCING_SERVER_SQS_ACCESS_KEY_ID'
if [ -z "$SYNCING_SERVER_SQS_ACCESS_KEY_ID" ]; then
  export SYNCING_SERVER_SQS_ACCESS_KEY_ID="x"
fi
file_env 'SYNCING_SERVER_SQS_SECRET_ACCESS_KEY'
if [ -z "$SYNCING_SERVER_SQS_SECRET_ACCESS_KEY" ]; then
  export SYNCING_SERVER_SQS_SECRET_ACCESS_KEY="x"
fi
if [ -z "$SYNCING_SERVER_SQS_ENDPOINT" ]; then
  export SYNCING_SERVER_SQS_ENDPOINT="http://localstack:4566"
fi

export SYNCING_SERVER_AUTH_SERVER_URL=http://localhost:$AUTH_SERVER_PORT

if [ -z "$SYNCING_SERVER_EMAIL_ATTACHMENT_MAX_BYTE_SIZE" ]; then
  export SYNCING_SERVER_EMAIL_ATTACHMENT_MAX_BYTE_SIZE=10485760
fi

if [ -z "$SYNCING_SERVER_REVISIONS_FREQUENCY" ]; then
  export SYNCING_SERVER_REVISIONS_FREQUENCY=300
fi

export SYNCING_SERVER_FILE_UPLOAD_PATH="/opt/shared/uploads"

printenv | grep SYNCING_SERVER_ | sed 's/SYNCING_SERVER_//g' > /opt/server/packages/syncing-server/.env


################
# FILES SERVER #
################

if [ -z "$FILES_SERVER_LOG_LEVEL" ]; then
  export FILES_SERVER_LOG_LEVEL="info"
fi
export FILES_SERVER_NODE_ENV="production"
export FILES_SERVER_VERSION="local"

if [ -z "$FILES_SERVER_MAX_CHUNK_BYTES" ]; then
  export FILES_SERVER_MAX_CHUNK_BYTES=100000000
fi

if [ -z "$FILES_SERVER_SNS_TOPIC_ARN" ]; then
  export FILES_SERVER_SNS_TOPIC_ARN="arn:aws:sns:us-east-1:000000000000:files-local-topic"
fi
if [ -z "$FILES_SERVER_SNS_ENDPOINT" ]; then
  export FILES_SERVER_SNS_ENDPOINT="http://localstack:4566"
fi
file_env 'FILES_SERVER_SNS_SECRET_ACCESS_KEY'
if [ -z "$FILES_SERVER_SNS_SECRET_ACCESS_KEY" ]; then
  export FILES_SERVER_SNS_SECRET_ACCESS_KEY="x"
fi
file_env 'FILES_SERVER_SNS_ACCESS_KEY_ID'
if [ -z "$FILES_SERVER_SNS_ACCESS_KEY_ID" ]; then
  export FILES_SERVER_SNS_ACCESS_KEY_ID="x"
fi
if [ -z "$FILES_SERVER_SNS_AWS_REGION" ]; then
  export FILES_SERVER_SNS_AWS_REGION="us-east-1"
fi
if [ -z "$FILES_SERVER_SQS_QUEUE_URL" ]; then
  export FILES_SERVER_SQS_QUEUE_URL="http://localstack:4566/000000000000/files-local-queue"
fi
if [ -z "$FILES_SERVER_SQS_AWS_REGION" ]; then
  export FILES_SERVER_SQS_AWS_REGION="us-east-1"
fi
file_env 'FILES_SERVER_SQS_ACCESS_KEY_ID'
if [ -z "$FILES_SERVER_SQS_ACCESS_KEY_ID" ]; then
  export FILES_SERVER_SQS_ACCESS_KEY_ID="x"
fi
file_env 'FILES_SERVER_SQS_SECRET_ACCESS_KEY'
if [ -z "$FILES_SERVER_SQS_SECRET_ACCESS_KEY" ]; then
  export FILES_SERVER_SQS_SECRET_ACCESS_KEY="x"
fi
if [ -z "$FILES_SERVER_SQS_ENDPOINT" ]; then
  export FILES_SERVER_SQS_ENDPOINT="http://localstack:4566"
fi

printenv | grep FILES_SERVER_ | sed 's/FILES_SERVER_//g' > /opt/server/packages/files/.env

#############
# REVISIONS #
#############

if [ -z "$REVISIONS_SERVER_LOG_LEVEL" ]; then
  export REVISIONS_SERVER_LOG_LEVEL="info"
fi

export REVISIONS_SERVER_NODE_ENV="production"
export REVISIONS_SERVER_VERSION="local"

if [ -z "$REVISIONS_SERVER_SNS_TOPIC_ARN" ]; then
  export REVISIONS_SERVER_SNS_TOPIC_ARN="arn:aws:sns:us-east-1:000000000000:revisions-server-local-topic"
fi
if [ -z "$REVISIONS_SERVER_SNS_ENDPOINT" ]; then
  export REVISIONS_SERVER_SNS_ENDPOINT="http://localstack:4566"
fi
file_env 'REVISIONS_SERVER_SNS_SECRET_ACCESS_KEY'
if [ -z "$REVISIONS_SERVER_SNS_SECRET_ACCESS_KEY" ]; then
  export REVISIONS_SERVER_SNS_SECRET_ACCESS_KEY="x"
fi
file_env 'REVISIONS_SERVER_SNS_ACCESS_KEY_ID'
if [ -z "$REVISIONS_SERVER_SNS_ACCESS_KEY_ID" ]; then
  export REVISIONS_SERVER_SNS_ACCESS_KEY_ID="x"
fi
if [ -z "$REVISIONS_SERVER_SNS_AWS_REGION" ]; then
  export REVISIONS_SERVER_SNS_AWS_REGION="us-east-1"
fi
if [ -z "$REVISIONS_SERVER_SQS_QUEUE_URL" ]; then
  export REVISIONS_SERVER_SQS_QUEUE_URL="http://localstack:4566/000000000000/revisions-server-local-queue"
fi
if [ -z "$REVISIONS_SERVER_SQS_AWS_REGION" ]; then
  export REVISIONS_SERVER_SQS_AWS_REGION="us-east-1"
fi
file_env 'REVISIONS_SERVER_SQS_ACCESS_KEY_ID'
if [ -z "$REVISIONS_SERVER_SQS_ACCESS_KEY_ID" ]; then
  export REVISIONS_SERVER_SQS_ACCESS_KEY_ID="x"
fi
file_env 'REVISIONS_SERVER_SQS_SECRET_ACCESS_KEY'
if [ -z "$REVISIONS_SERVER_SQS_SECRET_ACCESS_KEY" ]; then
  export REVISIONS_SERVER_SQS_SECRET_ACCESS_KEY="x"
fi
if [ -z "$REVISIONS_SERVER_SQS_ENDPOINT" ]; then
  export REVISIONS_SERVER_SQS_ENDPOINT="http://localstack:4566"
fi

printenv | grep REVISIONS_SERVER_ | sed 's/REVISIONS_SERVER_//g' > /opt/server/packages/revisions/.env

###############
# API GATEWAY #
###############

if [ -z "$API_GATEWAY_LOG_LEVEL" ]; then
  export API_GATEWAY_LOG_LEVEL="info"
fi
export API_GATEWAY_NODE_ENV=production
export API_GATEWAY_VERSION=local

export API_GATEWAY_SYNCING_SERVER_JS_URL=http://localhost:$SYNCING_SERVER_PORT
export API_GATEWAY_SYNCING_SERVER_GRPC_URL=0.0.0.0:$SYNCING_SERVER_GRPC_PORT
export API_GATEWAY_AUTH_SERVER_URL=http://localhost:$AUTH_SERVER_PORT
export API_GATEWAY_AUTH_SERVER_GRPC_URL=0.0.0.0:$AUTH_SERVER_GRPC_PORT
export API_GATEWAY_REVISIONS_SERVER_URL=http://localhost:$REVISIONS_SERVER_PORT
if [ -z "$PUBLIC_FILES_SERVER_URL" ]; then
  export PUBLIC_FILES_SERVER_URL=http://localhost:3125
fi
export API_GATEWAY_FILES_SERVER_URL=$PUBLIC_FILES_SERVER_URL

printenv | grep API_GATEWAY_ | sed 's/API_GATEWAY_//g' > /opt/server/packages/api-gateway/.env

# Run supervisor

supervisord -c /etc/supervisord.conf

exec "$@"
