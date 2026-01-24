FROM node:20-alpine AS build

WORKDIR /FloWealth

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /FloWealth/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx","-g","daemon off;"]