# Primera etapa: Instalación de dependencias
FROM --platform=$BUILDPLATFORM node:21.6.2-alpine3.19 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

# Segunda etapa: Construcción del proyecto
FROM --platform=$BUILDPLATFORM node:21.6.2-alpine3.19 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Tercera etapa: Preparación del entorno de ejecución
FROM --platform=$BUILDPLATFORM node:21.6.2-alpine3.19 AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copiar los archivos construidos desde la etapa builder al directorio de trabajo
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./.env

# Crear un usuario sin privilegios para ejecutar la aplicación
RUN adduser --disabled-password boxuser
RUN chown -R boxuser:boxuser /app
USER boxuser

CMD [ "node","dist/main" ]
