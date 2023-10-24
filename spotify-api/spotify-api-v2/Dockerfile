FROM node:20-alpine3.18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli 
COPY . ./

EXPOSE 3000

RUN ng build --configuration=production 


