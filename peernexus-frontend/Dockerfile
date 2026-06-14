# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for dependency caching)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

# Copy source and build the production bundle
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default Nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite dist output
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config: SPA fallback so React Router works on hard refresh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
