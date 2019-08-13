FROM node:10

# Update OS environment
RUN apt-get update ; apt-get upgrade -fy

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is use to ensure both package.json & packagae-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

# Development Build
RUN npm install

# Production Build
# RUN npm ci --only=production

# Bundle app source

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]
