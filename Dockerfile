# Etapa de desarrollo
FROM node:19-alpine3.15 as development
WORKDIR /app
COPY package.json ./
RUN npm install
CMD [ "npm","run","start:dev" ]

# Etapa de producción - Primera etapa: Instalación de dependencias
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS dev-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package.json
RUN npm install --frozen-lockfile

# Etapa de producción - Segunda etapa: Construcción del proyecto
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
# RUN npm run test:e2e
RUN npm run build

# Etapa de producción - Tercera etapa: Preparación del entorno de ejecución
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS prod-deps
WORKDIR /app
COPY package.json package.json
RUN npm install --production --frozen-lockfile

# Copiar los archivos construidos desde la etapa builder al directorio de trabajo
FROM --platform=$BUILDPLATFORM node:21.7.1-alpine3.19 AS production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Crear un usuario sin privilegios para ejecutar la aplicación
RUN adduser --disabled-password boxuser
RUN chown -R boxuser:boxuser /app
USER boxuser

CMD [ "node","dist/main.js" ]
