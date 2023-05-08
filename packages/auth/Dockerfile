FROM node:20.1.0-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

COPY ./ /workspace

WORKDIR /workspace/packages/auth

ENTRYPOINT [ "/workspace/packages/auth/docker/entrypoint.sh" ]

CMD [ "start-web" ]
