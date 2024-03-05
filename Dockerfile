# Primera etapa: Instalación de dependencias
FROM node:21.6.2-alpine3.19 AS deps
# Agregar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile

# Segunda etapa: Construcción del proyecto
FROM node:21.6.2-alpine3.19 AS builder
WORKDIR /app
# Copiar las dependencias instaladas previamente
COPY --from=deps /app/node_modules ./node_modules
# Copiar todos los archivos del proyecto
COPY . .
# Ejecutar el script de construcción
RUN npm run build

# Tercera etapa: Preparación del entorno de ejecución
FROM node:21.6.2-alpine3.19 AS runner
WORKDIR /app
# Solo copiar los archivos `package*.json` necesarios para instalar las dependencias de producción
COPY --from=builder /app/package*.json ./
# Instalar solo las dependencias necesarias para producción
RUN npm install --only=production

# Copiar los archivos construidos desde la etapa builder al directorio de trabajo
COPY --from=builder /app/dist ./dist
# Copiar el archivo .env
COPY --from=builder /app/.env ./.env

# Crear un usuario sin privilegios para ejecutar la aplicación
RUN adduser --disabled-password boxuser
# Cambiar la propiedad del directorio /app al nuevo usuario
RUN chown -R boxuser:boxuser /app
USER boxuser

# Comando para ejecutar la aplicación
CMD [ "node","dist/main" ]
