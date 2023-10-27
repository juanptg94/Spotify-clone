FROM  node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --update nodejs npm

COPY . ./

EXPOSE 3001
RUN npm install

CMD ["npm", "run", "devStart"]