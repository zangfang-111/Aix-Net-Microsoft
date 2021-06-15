FROM node:10.13.0-alpine

# install global deps
RUN npm config set unsafe-perm true
RUN npm install -g esm dotenv-safe

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN set -x \
  && apk update \
  && apk upgrade \
  && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
  && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
  && apk add --no-cache \
  autoconf \
  automake \
  python \
  libpng-dev \
  libtool \
  make \
  nasm \
  g++ \
  gcc \
  bash \
  git \
  openssh \
  udev \
  ttf-freefont \
  chromium

RUN npm install -g nodemon
RUN npm install -g puppeteer@1.10.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN mkdir -p packages/{lib,web}
COPY packages/lib/package*.json packages/lib/
COPY packages/web/package*.json packages/web/

RUN mkdir -p services/{api,api-dashboard,chat,db,mob,price,quote,session,sre,rfq}
COPY services/api/package*.json services/api/
COPY services/api-dashboard/package*.json services/api-dashboard/
COPY services/chat/package*.json services/chat/
COPY services/db/package*.json services/db/
COPY services/mob/package*.json services/mob/
COPY services/price/package*.json services/price/
COPY services/quote/package*.json services/quote/
COPY services/session/package*.json services/session/
COPY services/sre/package*.json services/sre/
COPY services/rfq/package*.json services/rfq/
COPY lerna*.json ./
# COPY .env ./

# We run npm install and lerna bootstrap first so we are able to cache the results
# TODO: If you are building your code for production
# RUN npm install --only=production
RUN npm install
RUN node_modules/.bin/lerna bootstrap

# Bundle app source
COPY . .
HEALTHCHECK --retries=3 --interval=4s --timeout=3s CMD node util/health_check.js

EXPOSE 5000
# CMD [ "/bin/sh", "-c", "node -r esm util/telegram.js & node_modules/.bin/moleculer-runner --instances 1 services/chat/chat.service.js"]
CMD [ "npm", "start" ]
