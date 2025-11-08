# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Accept build arguments
ARG VITE_API_URL
ARG VITE_BLOCKCHAIN_RPC_URL
ARG VITE_CONTRACT_ADDRESS

# Set environment variables for Vite build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BLOCKCHAIN_RPC_URL=$VITE_BLOCKCHAIN_RPC_URL
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
