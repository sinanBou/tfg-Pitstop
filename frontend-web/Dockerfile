# ETAPA 1: Construcción
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Variables de entorno en tiempo de compilación (Vite las incrusta)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copiar código fuente
COPY . .

# Compilar la SPA para producción
RUN npm run build

# ETAPA 2: Ejecución
FROM nginx:alpine

# Copiar los recursos compilados de la SPA
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx para soportar React Router (SPA) en puerto 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configurar permisos para que el usuario nginx (sin privilegios) pueda iniciar el servicio y escribir ficheros temporales
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html

# Cambiar contexto al usuario no-root 'nginx'
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]