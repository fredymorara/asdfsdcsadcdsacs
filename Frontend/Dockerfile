# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack (ships built-in with Node 20, no extra download needed)
RUN corepack enable pnpm

# Copy dependency files first for optimal layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies using frozen lockfile for reproducibility
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Build production bundle
RUN pnpm run build

# Production serve stage using lightweight nginx
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:5000/api/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
