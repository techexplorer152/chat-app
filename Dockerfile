FROM node:18-alpine

WORKDIR /app


COPY backend/package*.json ./

RUN npm install


COPY backend/ .


RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 5000


CMD ["node", "src/index.js"]