FROM ghcr.io/puppeteer/puppeteer:latest

USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Environment variables
ENV PORT=4000
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start command
CMD ["node", "dist/server.js"]
