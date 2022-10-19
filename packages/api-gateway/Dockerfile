FROM node:16.15.1-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

WORKDIR /workspace

COPY ./ /workspace

ENTRYPOINT [ "/workspace/packages/api-gateway/docker/entrypoint.sh" ]

CMD [ "start-web" ]
