# --- build ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts: prepare (husky) в контейнере не нужен
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# --- runtime: статика в nginx, проксирование /api и /ai делает gateway (infra/nginx) ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
