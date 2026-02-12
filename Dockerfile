# Build simple sans multi-stage pour debug
FROM node:20-alpine

WORKDIR /app

# Installer curl
RUN apk add --no-cache curl

# Copier tous les fichiers
COPY . .

# Installer les dépendances
RUN npm ci

# Générer Prisma
RUN npx prisma generate

# Build avec logs détaillés
RUN npm run build 2>&1 || (echo "BUILD FAILED" && exit 1)

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]