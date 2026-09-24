# Multi-stage Dockerfile for Module 1 - Intelligence Platform

# ============================================================================
# Base Stage - Common dependencies
# ============================================================================
FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# ============================================================================
# Dependencies Stage - Install production dependencies
# ============================================================================
FROM base AS dependencies

RUN npm ci --only=production && \
    npm cache clean --force

# ============================================================================
# Build Stage - Compile TypeScript
# ============================================================================
FROM base AS build

RUN npm ci

COPY src ./src
COPY migrations ./migrations

RUN npm run build

# ============================================================================
# Development Stage - For local development
# ============================================================================
FROM base AS development

RUN npm ci

COPY . .

ENV NODE_ENV=development
EXPOSE 3001

CMD ["npm", "run", "dev"]

# ============================================================================
# Production Stage - Optimized for production
# ============================================================================
FROM node:20-alpine AS production

RUN apk add --no-cache postgresql-client

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

ENV NODE_ENV=production
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
