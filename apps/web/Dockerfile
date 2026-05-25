FROM node:22-alpine
WORKDIR /app

# Copy root lock and manifests first for caching
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/

# Install dependencies at the workspace level
RUN npm install

# Copy application files and shared packages
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

WORKDIR /app/apps/web

EXPOSE 4200

# Enable host binding and polling for volume mounts and hot-reload in containers
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
