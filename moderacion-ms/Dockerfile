# ============================================================
# Dockerfile generado por microservicio-crud-archetype
# Etapa 1: compila el microservicio con Maven
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# ============================================================
# Etapa 2: imagen liviana solo con Java para ejecutar
# El Wallet de Oracle se monta en /app/wallet al ejecutar:
#   docker run -v <ruta-wallet>:/app/wallet -e DB_PASSWORD=... <imagen>
# ============================================================
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/moderacion-ms-1.0.0.jar app.jar
ENV DB_WALLET_PATH=/app/wallet
EXPOSE 8083
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
