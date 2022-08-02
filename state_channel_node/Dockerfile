# syntax=docker/dockerfile:1
FROM node:18.4.0-alpine 
RUN apk update && apk add bash

ENV NODE_ENV=benchmark

WORKDIR /app
COPY ["package.json", "yarn.lock", ".env" ,"./"]
RUN yarn install --production
COPY dist dist
COPY keys keys

# See https://github.com/ethers-io/ethers.js/issues/3082
CMD [ "node", "--openssl-legacy-provider", "dist/src/app.js"] 