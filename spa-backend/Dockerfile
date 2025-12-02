# 1. 빌드 단계 (Builder Stage)
FROM gradle:8.5-jdk21-alpine AS builder
WORKDIR /app

# 소스 코드 복사
COPY . .

# Gradle 빌드 실행 (테스트 제외하고 빌드)
RUN ./gradlew clean build -x test

# 2. 실행 단계 (Runtime Stage)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# 빌드 단계에서 생성된 JAR 파일만 복사
# (builder 단계의 /app/build/libs 경로에서 파일을 가져옴)
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
EXPOSE 8888