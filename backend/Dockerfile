# Dockerfile

# 1. Use the official Node.js 22 on Alpine
FROM node:22-alpine

# 2. Create app directory
WORKDIR /app

# 3. Copy and install dependencies
COPY package*.json ./
RUN npm install --production

# 4. Copy the rest of your source code
COPY . .

# 5. Expose your port and define the start command
EXPOSE 3000
CMD ["npm", "start"]
