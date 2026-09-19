# Multi-stage Dockerfile for Renew Contractor Portal
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json .npmrc* ./
RUN npm install

# Copy source code
COPY . .

# Build Vite frontend and bundled Express server
RUN npm run build

# Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json .npmrc* ./
RUN npm install --omit=dev

# Copy compiled server and frontend build from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
