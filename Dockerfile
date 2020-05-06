FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./ ./

CMD [ "npm", "start" ]
EXPOSE 3000