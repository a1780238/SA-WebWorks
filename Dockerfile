FROM node:24-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production
RUN npm test
CMD ["node", "dev-server.mjs"]
