FROM node:18.15.0-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

COPY ./ /workspace

WORKDIR /workspace/packages/analytics

ENTRYPOINT [ "/workspace/packages/analytics/docker/entrypoint.sh" ]

CMD [ "start-worker" ]
