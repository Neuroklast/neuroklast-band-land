# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_ACTIVATION_KEY
ARG NEXT_PUBLIC_ACTIVATION_API_URL
ENV NEXT_PUBLIC_ACTIVATION_KEY=$NEXT_PUBLIC_ACTIVATION_KEY
ENV NEXT_PUBLIC_ACTIVATION_API_URL=$NEXT_PUBLIC_ACTIVATION_API_URL
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Run as unprivileged user — nginx master process stays root only to bind
# port 80; worker processes drop privileges automatically via nginx config.
# For a fully rootless setup, use port 8080 and a non-root base image.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure the static files are readable by the nginx worker processes.
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
