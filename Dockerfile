# One container serves the React site and the PHP API (Apache + PHP). Built for Render.
# Stage 1 builds the React app; stage 2 is Apache + PHP with the build and the backend copied in.

FROM node:20-alpine AS web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql \
 && a2enmod rewrite headers \
 && echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
 && a2enconf servername

COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# The PHP backend lives outside the public web root; only the built site is public.
COPY backend/ /var/www/backend/
COPY --from=web /app/frontend/dist/ /var/www/html/

RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
 && chmod +x /usr/local/bin/entrypoint.sh \
 && rm -f /var/www/backend/config/config.local.php /var/www/backend/storage/*.log

# Render supplies $PORT (default 10000); entrypoint.sh points Apache at it.
EXPOSE 10000
CMD ["entrypoint.sh"]
