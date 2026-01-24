FROM node:20-alpine

WORKDIR /FloWealth

COPY package*json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5001

CMD ["node","dist/server.js"]