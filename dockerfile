FROM node

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm ci

COPY . .
EXPOSE 0-65535/tcp
CMD ["npm","start"]
