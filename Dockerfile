FROM node:10.13-alpine
ENV NODE_ENV production
ENV PORT 3030
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3030 3000
CMD npm start
