# Base image
FROM node:16-alpine
ENV TZ="Asia/Bangkok"
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

COPY .env.prod ./.env

RUN yarn

# Creates a "dist" folder with the production build
RUN npm run build

RUN rm .env
RUN rm .env.prod

EXPOSE 1337

# Start the server using the production build
CMD [ "npm", "start" ]
