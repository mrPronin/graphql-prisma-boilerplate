FROM node:10
WORKDIR "/app"
COPY ./package.json ./
RUN npm i -g prisma2 --unsafe-perm
RUN npm install
COPY . .
CMD sh prod-start.sh