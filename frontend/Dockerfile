# Use official Node.js 18 image as build environment
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy app source code
COPY . .

# Build the React app
RUN npm run build

# Use official nginx image to serve the app
FROM nginx:alpine

# Copy built app to nginx html folder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]