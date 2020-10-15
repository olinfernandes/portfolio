FROM node:10.13-alpine
ENV NODE_ENV production
ENV PORT 80
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 80 3000
CMD npm start