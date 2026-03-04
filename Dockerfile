# ================================
# IronForge Multi-Stage Dockerfile
# BuildKit required: DOCKER_BUILDKIT=1
# ================================

# syntax=docker/dockerfile:1

# Base stage with pnpm
FROM node:22-alpine AS base
# Add libc6-compat for Alpine compatibility (needed for Prisma and some Next.js binaries)
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# --------------------------------
# Dependencies stage (with BuildKit cache)
# --------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Include prisma schema for generate in deps or builder
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --------------------------------
# Development stage (with hot reload)
# --------------------------------
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NODE_ENV=development
EXPOSE 3000
CMD ["pnpm", "dev"]

# --------------------------------
# Production builder
# --------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true
RUN npx prisma generate && pnpm build

# --------------------------------
# Production runner (minimal, hardened)
# --------------------------------
FROM node:22-alpine AS runner
# Install curl for healthcheck and scheduled tasks
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Run as non-root user
RUN addgroup --system --gid 1001 ironforge && \
    adduser --system --uid 1001 titan
# Copy standalone output
COPY --from=builder --chown=titan:ironforge /app/.next/standalone ./
COPY --from=builder --chown=titan:ironforge /app/.next/static ./.next/static
COPY --from=builder --chown=titan:ironforge /app/public ./public

USER titan

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck for container orchestration (Coolify, Docker Swarm, K8s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

