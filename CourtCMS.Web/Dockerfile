# ============================================================
# DOCKERFILE FOR COURTCMS ANGULAR FRONTEND
# ============================================================
# Another multi-stage build, this time with two very different tools:
#
#   Stage 1 (build): Node.js compiles TypeScript/Angular into
#                     plain HTML, CSS, and JavaScript files.
#   Stage 2 (serve): Nginx serves those static files and
#                     proxies /api requests to the .NET API.
#
# Why Nginx instead of 'ng serve'?
#   ng serve is a DEVELOPMENT server — it's slow, not secure,
#   and not meant for production traffic. Nginx is an industry-
#   standard web server that handles thousands of requests per
#   second and is what real companies use in production.
# ============================================================


# ----------------------------------------------------------
# STAGE 1: BUILD THE ANGULAR APP
# ----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first (same caching trick as the .NET Dockerfile).
# If package.json hasn't changed, Docker reuses the cached
# 'npm ci' layer and skips re-downloading all node_modules.
COPY CourtCMS.Web/package.json CourtCMS.Web/package-lock.json ./

# 'npm ci' is the production version of 'npm install'.
# It does a clean install from the lockfile, which is faster
# and more deterministic than 'npm install'.
RUN npm ci

# Now copy the rest of the Angular source code
COPY CourtCMS.Web/ .

# Build the Angular app in production mode.
# This compiles TypeScript, tree-shakes unused code, minifies
# everything, and outputs static files to dist/
RUN npx ng build --configuration production --output-path=dist/app

# ----------------------------------------------------------
# STAGE 2: SERVE WITH NGINX
# ----------------------------------------------------------
# Nginx Alpine is only ~25MB — tiny, fast, and secure.
# It serves our compiled HTML/CSS/JS files and handles
# routing for the Angular SPA.
# ----------------------------------------------------------
FROM nginx:alpine AS runtime

# Remove the default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx config (handles SPA routing + API proxy)
COPY CourtCMS.Web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled Angular files from the build stage.
# The output path follows Angular's convention: dist/<project-name>/browser/
COPY --from=build /app/dist/app/browser /usr/share/nginx/html

# Nginx listens on port 80 by default
EXPOSE 80

# Start Nginx in the foreground (required for Docker)
# By default Nginx runs as a background daemon, but Docker
# needs the main process to stay in the foreground or the
# container exits immediately.
CMD ["nginx", "-g", "daemon off;"]