FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --cache /tmp/npm-cache
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
