# ═══════════════════════════════════════════════════════════════
# Stage 1: Build static export with pnpm
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

# Build Next.js static export (output: 'export' -> ./out)
RUN pnpm build

# ═══════════════════════════════════════════════════════════════
# Stage 2: Serve static files with nginx
# ═══════════════════════════════════════════════════════════════
FROM nginx:alpine AS runner

# Custom nginx config (handles Next.js export .html routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static export from builder
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
