# -------------------------------------------------------------
# Production Dockerfile for CivicResolve (Google Cloud Run Ready)
# Multi-stage build, Next.js Standalone output, SQLite persistence,
# Non-root secure execution on $PORT (8080)
# -------------------------------------------------------------

# Stage 1: Base image with native build tools for better-sqlite3
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++

# Stage 2: Install dependencies with native bindings compiled
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Stage 3: Build Next.js application with standalone output
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 4: Production Runner Stage (Minimal, Non-Root)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH=/app/data/civicresolve.db

# Required for prebuilt / compiled C++ native modules on alpine
RUN apk add --no-cache libc6-compat

# Security: Dedicated system user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set up writable data directory for SQLite database persistence
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy public static assets and pre-rendered bundles
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Guarantee better-sqlite3 native bindings are present in runner node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
