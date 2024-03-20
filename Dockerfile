# Etapa de producción - Primera etapa: Instalación de dependencias
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS build-deps
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile && npm cache clean --force

# Etapa de producción - Segunda etapa: Construcción del proyecto
FROM build-deps AS builder
COPY --from=build-deps package*.json ./
COPY src ./src
COPY tsconfig.build.json tsconfig.json ./
RUN npm run build

# Etapa de producción - Tercera etapa: Preparación del entorno de ejecución
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev --frozen-lockfile && npm cache clean --force

# Crear un usuario sin privilegios para ejecutar la aplicación
RUN addgroup -S boxgroup && adduser --disabled-password -S boxuser -G boxgroup
RUN chown -R boxuser:boxgroup /app
USER boxuser

CMD ["node", "dist/main.js"]
