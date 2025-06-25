# Use the official Bun image
# Bun image already includes Node.js
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files for production dependencies
COPY package.json bun.lock* ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy built application from build stage
COPY --from=base /app/build ./build
COPY --from=base /app/package.json ./package.json

# Copy any other necessary files (static files, etc.)
COPY --from=base /app/static ./static

# Create a non-root user
RUN addgroup --system --gid 1001 sveltekit
RUN adduser --system --uid 1001 sveltekit
RUN chown -R sveltekit:sveltekit /app
USER sveltekit

# Expose the port the app runs on
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "build/index.js"]
