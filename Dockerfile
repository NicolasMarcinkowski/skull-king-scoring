# ═══════════════════════════════════════════════════════════════
# Stage 1: Build Next.js standalone with pnpm
# ═══════════════════════════════════════════════════════════════
FROM node:22-alpine AS builder

# Enable Corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js (standalone mode)
RUN pnpm build

# ═══════════════════════════════════════════════════════════════
# Stage 2: Production Runner
# ═══════════════════════════════════════════════════════════════
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
