FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npm ci && npm run tsc

EXPOSE 3000
CMD ["node", "dist/httpServer.js"]