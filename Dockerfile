FROM node:10.24-slim

WORKDIR /usr/src/app

COPY package*.json ./wait-for-it.sh ./

COPY ./RowStreamSDK ./RowStreamSDK
COPY ./dist ./dist
COPY ./assets ./assets

RUN npm install

EXPOSE 3000
EXPOSE 8080

CMD [ "node", "./dist/src/server.js" ]