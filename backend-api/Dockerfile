# Etapa 1: Compilación
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilamos saltando los tests 
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:25-jdk
WORKDIR /app
# Copiamos el .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 9091
ENTRYPOINT ["java", "-jar", "app.jar"]