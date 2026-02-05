FROM node:20-alpine AS build

WORKDIR /FloWealth


ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_CLOUDFLARE_SITE_KEY

COPY package*.json ./
RUN npm install

ENV VITE_CLOUDFLARE_SITE_KEY=$VITE_CLOUDFLARE_SITE_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID


COPY . .

RUN  npm run build

FROM nginx:stable-alpine

COPY --from=build /FloWealth/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx","-g","daemon off;"]