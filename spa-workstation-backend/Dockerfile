# 1. 자바 기반 이미지 사용 (경량화된 Eclipse Temurin 권장)
FROM eclipse-temurin:21-jdk-alpine

# 2. 빌드된 Jar 파일을 컨테이너에 복사 (Gradle/Maven 빌드 결과물)
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# 3. Spring Boot 애플리케이션 실행 명령어 정의
ENTRYPOINT ["java", "-jar", "app.jar"]

# 4. Spring Boot 기본 포트 노출 (외부 접속을 위한 것이 아닌 내부 문서화용)
EXPOSE 8080