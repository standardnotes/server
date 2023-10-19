FROM node:20.6.1-alpine

ENV NODE_ENV production

RUN apk add --update --no-cache \
  g++ \
  make \
  openssl \
  curl \
  bash \
  py3-pip

RUN pip install --no-cache-dir --upgrade supervisor

RUN mkdir -p /var/lib/server/logs

COPY docker/supervisord.conf /etc/supervisord.conf

COPY docker/docker-entrypoint.sh /usr/local/bin/

COPY . /opt/server

WORKDIR /opt/server

RUN corepack enable

RUN yarn install --immutable

RUN CI=true yarn build

RUN mkdir -p /opt/shared/uploads

ENTRYPOINT ["docker-entrypoint.sh"]
