FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT 3000
EXPOSE 3000
CMD [ "npm", "start" ]
