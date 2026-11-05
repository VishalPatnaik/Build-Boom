# Production image for TOWER//SHIFT (Cloud Run, Fly.io, Render, any container host)
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=build /app/dist ./dist
COPY server.ts serverTournaments.ts tournaments_store.json ./
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.ts"]
