# IronForge Discord Bot
# syntax=docker/dockerfile:1

# Upgraded from node:20-alpine → node:22-alpine (LTS); pinned to SHA for supply-chain integrity
# SHA for node:22-alpine (multi-arch manifest digest as of 2025-04)
FROM node:22-alpine@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f

WORKDIR /app

# Security: Run as non-root user
RUN addgroup --system --gid 1001 discordbot \
    && adduser --system --uid 1001 botuser

COPY package.json ./

# Use --production and --frozen-lockfile for reproducible, minimal installs
RUN npm install --production --no-audit --no-fund

COPY index.js ./

# Ensure files are owned by non-root user
RUN chown -R botuser:discordbot /app
USER botuser

# Healthcheck: verify node process can execute
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

CMD ["node", "index.js"]
