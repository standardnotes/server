FROM node:18.13.0-alpine

RUN apk add --update \
  bash \
  curl \
  py3-pip \
  && rm -rf /var/cache/apk/*

ENV NODE_ENV production

RUN corepack enable

RUN pip install --no-cache-dir --upgrade supervisor

RUN mkdir -p /var/lib/server/logs

COPY docker/supervisord.conf /etc/supervisord.conf

COPY docker/docker-entrypoint.sh /usr/local/bin/

COPY . /opt/server

WORKDIR /opt/server

RUN yarn install --immutable

RUN yarn build

ENTRYPOINT ["docker-entrypoint.sh"]