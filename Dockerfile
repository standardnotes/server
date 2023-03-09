FROM node:18.15.0-alpine

ENV NODE_ENV production

RUN apk add --update --no-cache \
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

RUN mkdir -p \
  /opt/bundled/syncing-server \
  /opt/bundled/auth \
  /opt/bundled/files \
  /opt/bundled/revisions \
  /opt/bundled/api-gateway \
  /opt/shared/uploads

RUN yarn workspace @standardnotes/syncing-server bundle --no-compress --output-directory /opt/bundled/syncing-server
RUN yarn workspace @standardnotes/auth-server bundle --no-compress --output-directory /opt/bundled/auth
RUN yarn workspace @standardnotes/files-server bundle --no-compress --output-directory /opt/bundled/files
RUN yarn workspace @standardnotes/revisions-server bundle --no-compress --output-directory /opt/bundled/revisions
RUN yarn workspace @standardnotes/api-gateway bundle --no-compress --output-directory /opt/bundled/api-gateway

WORKDIR /opt/bundled

RUN rm -rf /opt/server

ENTRYPOINT ["docker-entrypoint.sh"]
