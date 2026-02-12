FROM node:20-alpine

WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Run
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "start"]