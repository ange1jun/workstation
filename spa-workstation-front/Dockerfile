# Stage 1: 빌드 환경 (Node.js)
FROM node:20-alpine as builder
WORKDIR /app

# 1. 의존성 파일 복사 (캐시 활용의 핵심)
COPY package.json package-lock.json ./

# 2. 의존성 설치
RUN npm install

# 3. 나머지 소스 코드 복사
COPY . .

# 4. 빌드 실행
RUN npm run build # React 빌드 명령어 실행

# Stage 2: 실행 환경 (Nginx)
FROM nginx:alpine
# 빌드된 결과물을 Nginx의 기본 웹 루트(/usr/share/nginx/html)로 복사
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx 설정 파일 복사 (API 통신을 위해 필요할 수 있습니다)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80