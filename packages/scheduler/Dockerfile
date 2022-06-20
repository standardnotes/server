FROM node:16.13.1-alpine3.15

ARG UID=1001
ARG GID=1001

RUN addgroup -S scheduler -g $GID && adduser -D -S scheduler -G scheduler -u $UID

RUN apk add --update --no-cache \
    curl \
    alpine-sdk \
    python3

WORKDIR /var/www

RUN chown -R $UID:$GID .

USER scheduler

COPY --chown=$UID:$GID package.json yarn.lock /var/www/

RUN yarn install

COPY --chown=$UID:$GID . /var/www

RUN yarn build

ENTRYPOINT [ "docker/entrypoint.sh" ]

CMD [ "start-worker" ]
