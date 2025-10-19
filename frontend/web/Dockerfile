# syntax=docker/dockerfile:1.7

########## DEPENDENCIES ##########
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY frontend/web/package*.json ./
RUN npm ci --only=production

########## BUILD ##########
FROM node:20-alpine AS builder
WORKDIR /app

COPY frontend/web/package*.json ./
RUN npm ci

COPY frontend/web/ ./
RUN npm run build

########## RUNTIME ##########
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
