
# Use Node.js
FROM node:20

# Set working directory
WORKDIR /src

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Render application port
EXPOSE 3000

# Start ReShare
CMD ["npm", "start"]
