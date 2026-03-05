# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_ACTIVATION_KEY
ARG VITE_ACTIVATION_API_URL
ENV VITE_ACTIVATION_KEY=$VITE_ACTIVATION_KEY
ENV VITE_ACTIVATION_API_URL=$VITE_ACTIVATION_API_URL
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
