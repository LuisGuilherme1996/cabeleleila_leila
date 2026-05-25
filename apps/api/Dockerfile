FROM node:22-alpine
WORKDIR /app

# Copy root lock and manifests first for caching
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies at the workspace level
RUN npm install

# Copy application files
COPY apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["npm", "run", "dev"]
