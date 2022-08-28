# syntax=docker/dockerfile:1
FROM node:18.4.0-alpine 
RUN apk update && apk add git bash
RUN apk add g++ make py3-pip

ENV NODE_ENV=benchmark

WORKDIR /app
COPY . .
WORKDIR /app/contracts
RUN yarn install --non-interactive --frozen-lockfile

CMD [ "npm", "run", "chain" ]