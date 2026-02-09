FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite headers

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Create necessary directories with proper permissions
RUN mkdir -p /var/www/html/uploads/gallery \
    && mkdir -p /var/www/html/server/data \
    && mkdir -p /var/www/html/server/config \
    && chown -R www-data:www-data /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/server/data \
    && chmod -R 755 /var/www/html/uploads \
    && chmod -R 755 /var/www/html/server/data

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
