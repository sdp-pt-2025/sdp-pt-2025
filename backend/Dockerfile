# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY . .

# Expose port (should match your app's listening port)
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]