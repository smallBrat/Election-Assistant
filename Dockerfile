ARG NODE_IMAGE=node:20.19.5-alpine3.22

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy all source files and build the static client
COPY . .
RUN npm run build

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production dependencies needed by server.mjs.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy the built client and the small Cloud Run server.
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node server.mjs ./server.mjs

# Run as a non-root user in production.
USER node

EXPOSE 8080

CMD ["node", "server.mjs"]
