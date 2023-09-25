#!/usr/bin/env bash

set -euo pipefail

echo "configuring sns/sqs"
echo "==================="
LOCALSTACK_HOST=localhost
AWS_REGION=us-east-1
LOCALSTACK_DUMMY_ID=000000000000

get_all_queues() {
  awslocal --endpoint-url=http://${LOCALSTACK_HOST}:4566 sqs list-queues
}

create_queue() {
  local QUEUE_NAME_TO_CREATE=$1
  awslocal --endpoint-url=http://${LOCALSTACK_HOST}:4566 sqs create-queue --queue-name ${QUEUE_NAME_TO_CREATE}
}

get_all_topics() {
  awslocal --endpoint-url=http://${LOCALSTACK_HOST}:4566 sns list-topics
}

create_topic() {
  local TOPIC_NAME_TO_CREATE=$1
  awslocal --endpoint-url=http://${LOCALSTACK_HOST}:4566 sns create-topic --name ${TOPIC_NAME_TO_CREATE}
}

link_queue_and_topic() {
  local TOPIC_ARN_TO_LINK=$1
  local QUEUE_ARN_TO_LINK=$2
  awslocal --endpoint-url=http://${LOCALSTACK_HOST}:4566 sns subscribe --topic-arn ${TOPIC_ARN_TO_LINK} --protocol sqs --notification-endpoint ${QUEUE_ARN_TO_LINK}
}

get_queue_arn_from_name() {
  local QUEUE_NAME=$1
  echo "arn:aws:sns:${AWS_REGION}:${LOCALSTACK_DUMMY_ID}:$QUEUE_NAME"
}

get_topic_arn_from_name() {
  local TOPIC_NAME=$1
  echo "arn:aws:sns:${AWS_REGION}:${LOCALSTACK_DUMMY_ID}:$TOPIC_NAME"
}

PAYMENTS_TOPIC_NAME="payments-local-topic"

echo "creating topic $PAYMENTS_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${PAYMENTS_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
PAYMENTS_TOPIC_ARN=$(get_topic_arn_from_name $PAYMENTS_TOPIC_NAME)

SYNCING_SERVER_TOPIC_NAME="syncing-server-local-topic"

echo "creating topic $SYNCING_SERVER_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${SYNCING_SERVER_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
SYNCING_SERVER_TOPIC_ARN=$(get_topic_arn_from_name $SYNCING_SERVER_TOPIC_NAME)

AUTH_TOPIC_NAME="auth-local-topic"

echo "creating topic $AUTH_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${AUTH_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
AUTH_TOPIC_ARN=$(get_topic_arn_from_name $AUTH_TOPIC_NAME)

FILES_TOPIC_NAME="files-local-topic"

echo "creating topic $FILES_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${FILES_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
FILES_TOPIC_ARN=$(get_topic_arn_from_name $FILES_TOPIC_NAME)

ANALYTICS_TOPIC_NAME="analytics-local-topic"

echo "creating topic $ANALYTICS_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${ANALYTICS_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
ANALYTICS_TOPIC_ARN=$(get_topic_arn_from_name $ANALYTICS_TOPIC_NAME)

REVISIONS_TOPIC_NAME="revisions-server-local-topic"

echo "creating topic $REVISIONS_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${REVISIONS_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
REVISIONS_TOPIC_ARN=$(get_topic_arn_from_name $REVISIONS_TOPIC_NAME)

SCHEDULER_TOPIC_NAME="scheduler-local-topic"

echo "creating topic $SCHEDULER_TOPIC_NAME"
TOPIC_CREATED_RESULT=$(create_topic ${SCHEDULER_TOPIC_NAME})
echo "created topic: $TOPIC_CREATED_RESULT"
SCHEDULER_TOPIC_ARN=$(get_topic_arn_from_name $SCHEDULER_TOPIC_NAME)

QUEUE_NAME="analytics-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
ANALYTICS_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "linking topic $PAYMENTS_TOPIC_ARN to queue $ANALYTICS_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $PAYMENTS_TOPIC_ARN $ANALYTICS_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

QUEUE_NAME="auth-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
AUTH_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "linking topic $PAYMENTS_TOPIC_ARN to queue $AUTH_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $PAYMENTS_TOPIC_ARN $AUTH_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"
echo "linking topic $AUTH_TOPIC_ARN to queue $AUTH_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $AUTH_TOPIC_ARN $AUTH_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"
echo "linking topic $FILES_TOPIC_ARN to queue $AUTH_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $FILES_TOPIC_ARN $AUTH_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"
echo "linking topic $REVISIONS_TOPIC_ARN to queue $AUTH_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $REVISIONS_TOPIC_ARN $AUTH_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

QUEUE_NAME="files-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
FILES_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "linking topic $AUTH_TOPIC_ARN to queue $FILES_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $AUTH_TOPIC_ARN $FILES_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

echo "linking topic $SYNCING_SERVER_TOPIC_ARN to queue $FILES_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $SYNCING_SERVER_TOPIC_ARN $FILES_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

QUEUE_NAME="syncing-server-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
SYNCING_SERVER_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "linking topic $SYNCING_SERVER_TOPIC_ARN to queue $SYNCING_SERVER_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $SYNCING_SERVER_TOPIC_ARN $SYNCING_SERVER_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

echo "linking topic $FILES_TOPIC_ARN to queue $SYNCING_SERVER_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $FILES_TOPIC_ARN $SYNCING_SERVER_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

echo "linking topic $SYNCING_SERVER_TOPIC_ARN to queue $AUTH_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $SYNCING_SERVER_TOPIC_ARN $AUTH_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

echo "linking topic $AUTH_TOPIC_ARN to queue $SYNCING_SERVER_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $AUTH_TOPIC_ARN $SYNCING_SERVER_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

QUEUE_NAME="revisions-server-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
REVISIONS_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "linking topic $SYNCING_SERVER_TOPIC_ARN to queue $REVISIONS_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $SYNCING_SERVER_TOPIC_ARN $REVISIONS_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

echo "linking topic $REVISIONS_TOPIC_ARN to queue $REVISIONS_QUEUE_ARN"
LINKING_RESULT=$(link_queue_and_topic $REVISIONS_TOPIC_ARN $REVISIONS_QUEUE_ARN)
echo "linking done:"
echo "$LINKING_RESULT"

QUEUE_NAME="scheduler-local-queue"

echo "creating queue $QUEUE_NAME"
QUEUE_URL=$(create_queue ${QUEUE_NAME})
echo "created queue: $QUEUE_URL"
SCHEDULER_QUEUE_ARN=$(get_queue_arn_from_name $QUEUE_NAME)

echo "all topics are:"
echo "$(get_all_topics)"

echo "all queues are:"
echo "$(get_all_queues)"
