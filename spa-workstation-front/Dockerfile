# Stage 1: 빌드 환경 (Node.js)
FROM node:20-alpine as builder
WORKDIR /app

# 빌드 인자 선언
ARG VITE_API_URL=/api

# 환경 변수로 설정
ENV VITE_API_URL=$VITE_API_URL

# 의존성 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드 실행 (환경 변수가 번들에 포함됨)
RUN npm run build

# Stage 2: 실행 환경 (Nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80