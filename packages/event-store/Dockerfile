FROM node:20.2.0-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

COPY ./ /workspace

WORKDIR /workspace/packages/event-store

ENTRYPOINT [ "/workspace/packages/event-store/docker/entrypoint.sh" ]

CMD [ "start-worker" ]
