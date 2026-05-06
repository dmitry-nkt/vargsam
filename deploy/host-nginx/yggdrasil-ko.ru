# Хостовый nginx: Let's Encrypt (HTTP-01), редирект на HTTPS, прокси в Docker.

server {
    listen 80;
    listen [::]:80;
    server_name yggdrasil-ko.ru;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type "text/plain";
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yggdrasil-ko.ru;

    ssl_certificate /etc/letsencrypt/live/yggdrasil-ko.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yggdrasil-ko.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    access_log /var/log/nginx/yggdrasil-ko.ru.access.log;
    error_log /var/log/nginx/yggdrasil-ko.ru.error.log;
}
