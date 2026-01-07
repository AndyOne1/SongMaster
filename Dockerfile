# Dockerfile for SongMaster Backend
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server/ ./server/

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Run the server
CMD ["node", "server/index.js"]
