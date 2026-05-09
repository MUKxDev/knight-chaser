# Use the official Bun image
FROM oven/bun:1-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
# Bun uses bun.lockb (binary) or bun.lock (text)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Build the game
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set Next.js to standalone mode in your next.config.js
RUN bun run build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
# Create a non-root user for security
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Note: Added --chown=nextjs:nextjs to ensure the runtime user has correct permissions
COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
# Run the standalone server using Bun
CMD ["bun", "server.js"]
