# Node.js 22버전 사용
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /back

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 프로젝트 파일 복사
COPY . ./

# 빌드
RUN npm run build

# pm2 설치
RUN npm install pm2 -g

ENV NODE_ENV production

# 애플리케이션 포트 노출
EXPOSE 3000

# pm2 사용해서 애플리케이션 실행 
CMD ["pm2-runtime", "start", "/back/dist/main.js"]