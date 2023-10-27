FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --update nodejs npm
RUN npm install
RUN npm install -g @angular/cli

COPY . ./

EXPOSE 3000

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "3000"]


