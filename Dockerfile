# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files and build the static client
COPY . .
RUN npm run build

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies needed by server.mjs.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built client and the small Cloud Run server.
COPY --from=builder /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 8080

CMD ["node", "server.mjs"]
