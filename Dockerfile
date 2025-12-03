# Build Stage 1
FROM node:22-alpine AS build
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy only dependency files first
COPY package.json pnpm-lock.yaml ./

# Copy prisma folder before installing dependencies
COPY prisma ./prisma

# Copy เฉพาะไฟล์ package.json และ package-lock.json
# ส่วนนี้ช่วย Cache ทำให้การรันซ้ำเมื่อโค้ดเปลี่ยนแปลง จะไม่รัน `npm install` ซ้ำหลายครั้ง จนกว่าจะมี Package ที่เปลี่ยนแปลงไป
COPY package*.json ./

# Install dependencies (prisma generate will run now)
RUN pnpm i

# Copy rest of the project
COPY . .

# Build the Nuxt app
RUN pnpm run build

# Stage 2: Production image
FROM node:22-alpine
WORKDIR /app

# Copy built output
COPY --from=build /app/.output/ ./

# Copy node_modules for runtime dependencies
COPY --from=build /app/node_modules ./node_modules

# Environment variables
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "server/index.mjs"]
