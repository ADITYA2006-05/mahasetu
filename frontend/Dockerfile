# Multi-stage Docker build for React + Vite Frontend on Railway
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_BASE_URL=https://mahasetu-production.up.railway.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

ENV PORT=80
EXPOSE 80

CMD serve -s dist -l ${PORT:-80}
