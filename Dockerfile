FROM node:current

WORKDIR /app

COPY package*.json ./
COPY index.js ./
COPY notification ./notification

RUN npm ci --production

USER node
EXPOSE 3000
CMD ["npm", "start"]
