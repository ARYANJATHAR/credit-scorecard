FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV VITE_API_URL=https://backend-production-a90e.up.railway.app

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
