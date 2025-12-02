#!/usr/bin/env bash
set -e
git pull
composer install
npm run build
php artisan migrate
php artisan queue:restart
php artisan optimize:clear
