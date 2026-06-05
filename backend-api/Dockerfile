# Etapa 1: Compilación
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilamos saltando los tests 
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:25-jre
WORKDIR /app

# Crear grupo y usuario de sistema sin privilegios para Spring Boot
RUN groupadd -r spring && useradd -r -g spring spring

# Copiamos el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Cambiar propietario de la carpeta de la aplicación
RUN chown -R spring:spring /app

# Cambiar contexto al usuario no-root
USER spring

EXPOSE 9091
ENTRYPOINT ["java", "-jar", "app.jar"]