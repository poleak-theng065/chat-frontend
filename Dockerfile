# ── Frontend Dockerfile (multi-stage) ───────────────────────────────────────
#
# Stage 1 — Build
#   Uses Node to run `vite build`. The .env.docker file sets VITE_BACKEND_URL=""
#   so the built JS connects to the same origin (Nginx proxies /socket.io).
#
# Stage 2 — Serve
#   Copies the built /dist into Nginx. Nginx serves static files and
#   reverse-proxies /api and /socket.io to the backend container.

# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Use the Docker-specific env file so VITE_BACKEND_URL is empty at build time
RUN cp .env.docker .env && npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default Nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built Vue app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
