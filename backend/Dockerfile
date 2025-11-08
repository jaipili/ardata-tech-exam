FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create contracts directory for ABI
RUN mkdir -p src/contracts

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
