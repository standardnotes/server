FROM node:20.10.0-alpine

RUN apk add --update \
  curl \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

COPY ./ /workspace

WORKDIR /workspace

RUN yarn install --immutable

RUN yarn build

WORKDIR /workspace/packages/revisions

ENTRYPOINT [ "/workspace/packages/revisions/docker/entrypoint.sh" ]

CMD [ "start-web" ]
