# Etapa 1: Construcción (Node.js)
FROM node:20 AS build
WORKDIR /app


ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL


# Copiamos solo los archivos de dependencias primero 
COPY package*.json ./
RUN npm install
# Copiamos el resto del código y construimos la app
COPY . .
RUN npm run build



# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos el resultado de Vite (la carpeta /dist) al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]