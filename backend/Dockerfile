# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Generate OpenAPI spec
RUN npx tsx src/docs/generateOpenApi.ts

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Environment defaults
ENV NODE_ENV=production \
    PORT=3001 \
    DATABASE_PATH=/app/data/module2.db \
    INTELLIGENCE_PROVIDER=mock

# Install production dependencies only and sqlite tools
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs/openapi.json ./dist/docs/openapi.json

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]
