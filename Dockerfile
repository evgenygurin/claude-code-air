# Multi-stage build for optimized Docker image
# Stage 1: Build
FROM node:20-alpine AS builder

LABEL maintainer="TypeScript REST API Team"
LABEL description="Production-ready REST API with TypeScript and Express"

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies with security audit
RUN npm ci --only=production && npm audit --audit-level=moderate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
# Handle case where GID 1000 might already exist
RUN (addgroup -g 1000 appuser 2>/dev/null || addgroup appuser) && \
    adduser -D -u 1000 -G appuser appuser

# Copy runtime dependencies
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package*.json ./

# Set permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
