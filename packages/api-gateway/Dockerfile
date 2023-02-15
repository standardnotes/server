FROM node:18.13.0-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

COPY ./ /workspace

WORKDIR /workspace/packages/api-gateway

ENTRYPOINT [ "/workspace/packages/api-gateway/docker/entrypoint.sh" ]

CMD [ "start-web" ]
