# ETAPA 1: Construcción
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# ETAPA 2: Ejecución
FROM eclipse-temurin:25-jdk
WORKDIR /app
RUN useradd -m usuario
COPY --from=build /app/target/*.jar app.jar
RUN chown usuario:usuario app.jar
USER usuario
EXPOSE 9091
ENTRYPOINT ["java", "-jar", "app.jar"]