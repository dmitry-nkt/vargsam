# Хостовый nginx на VPS: прокси в Docker (статика :8080, заявки :8787).
# Деплоится из CI в DEPLOY_PATH/nginx-host/, затем копируется в sites-available.

server {
    listen 80;
    listen [::]:80;
    server_name yggdrasil-ko.ru www.yggdrasil-ko.ru;

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
