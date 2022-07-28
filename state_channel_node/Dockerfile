# syntax=docker/dockerfile:1
FROM node:18.4.0-alpine 
RUN apk update && apk add bash

ENV NODE_ENV=benchmark
ENV APP_IDENTITY=0
ENV APP_MNEMONIC="bottom century muffin success mask duck brief wet soap harbor inch point"
ENV APP_ADDRESS_CONTRACT=0x
ENV APP_ADDRESS_0=0x710dBcA50d961B708b8C659b3cBDf0042cDda442
ENV APP_ADDRESS_1=0x710dBcA50d961B708b8C659b3cBDf0042cDda442
ENV APP_ADDRESS_2=0x710dBcA50d961B708b8C659b3cBDf0042cDda442 
ENV APP_ADDRESS_3=0x710dBcA50d961B708b8C659b3cBDf0042cDda442 

WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY dist dist
COPY keys keys

# See https://github.com/ethers-io/ethers.js/issues/3082
CMD [ "node", "--openssl-legacy-provider", "dist/src/app.js"] 