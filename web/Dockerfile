FROM node:22-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ─── Dev ──────────────────────────────────────────────────────────────────────
# Le code source est monté via un volume, pas copié dans l'image.
FROM deps AS dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ─── Build ────────────────────────────────────────────────────────────────────
FROM deps AS build
COPY . .
RUN npm run build

# ─── Prod ─────────────────────────────────────────────────────────────────────
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
