# Production Dockerfile for CivicResolve (Deployable to Google Cloud Run)

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules if needed
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

# Run production build using stable Webpack configuration
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

# Grant write permissions for local persistence
RUN chown -R nextjs:nodejs /app/data

USER nextjs

EXPOSE 8080

CMD ["npx", "next", "start", "-p", "8080"]
