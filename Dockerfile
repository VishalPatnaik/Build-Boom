# API server for the TOWER//SHIFT Android app (tournaments and leaderboards).
# The game itself ships inside the APK; this image does not serve it as a website.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server.ts serverTournaments.ts tournaments_store.json ./
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.ts"]
