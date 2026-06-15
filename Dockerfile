FROM node:18-alpine

WORKDIR /app

# Install git for git operations
RUN apk add --no-cache git

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
