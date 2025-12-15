FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source and prisma
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client and build TypeScript
RUN npm run prisma:generate || true
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production --omit=dev

EXPOSE 4000

ENV NODE_ENV=production

CMD ["sh", "-c", "npm run prisma:migrate -- --skip-generate && node dist/index.js"]
