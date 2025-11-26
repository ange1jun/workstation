# Stage 1: 빌드 환경 (Node.js)
FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build # React 빌드 명령어 실행

# Stage 2: 실행 환경 (Nginx)
FROM nginx:alpine
# 빌드된 결과물을 Nginx의 기본 웹 루트(/usr/share/nginx/html)로 복사
COPY --from=builder /app/build /usr/share/nginx/html
# Nginx 설정 파일 복사 (필요하다면)
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80