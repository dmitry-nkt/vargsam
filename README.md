## scenax-card-site (визитка)

Статика генерируется через **Astro** и деплоится в существующий `gh-pages` в корень сайта.

### Разработка

```bash
npm install
npm run dev
```

### Сборка

```bash
npm run build
```

Собранные файлы лежат в `dist`.

### Деплой

В корне репозитория есть GitHub Actions workflow `.github/deploy.yml`, который публикует `dist` в `gh-pages` (в корень).

Как запустить:
1. GitHub `Actions`
2. Workflow `Deploy Card Site to GitHub Pages`
3. `Run workflow`

Также деплой срабатывает автоматически при `push` в ветку `main`.

### Мини-сервис заявок на VPS

В репозитории есть `api/server.mjs` (Node.js + SMTP), разворачивается на VPS в Docker и принимает `POST /api/lead`.

Что нужно настроить один раз:

1. **Nginx прокси** на VPS:

```nginx
location / {
  proxy_pass http://127.0.0.1:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /api/ {
  proxy_pass http://127.0.0.1:8787;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Для домена `yggdrasil-ko.ru` используйте:

```nginx
server {
  server_name yggdrasil-ko.ru www.yggdrasil-ko.ru;

  # ... остальная конфигурация сайта ...

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

2. **GitHub Secrets** для workflow:
`DEPLOY_API_PATH`, `LEADS_PORT`, `LEADS_ALLOW_ORIGIN`, `LEADS_SMTP_HOST`, `LEADS_SMTP_PORT`,
`LEADS_SMTP_SECURE`, `LEADS_SMTP_USER`, `LEADS_SMTP_PASS`, `LEADS_MAIL_FROM`, `LEADS_MAIL_TO`, `LEADS_SUBJECT`.

3. На сервере `docker`/`docker compose` заранее не обязателен: workflow установит их автоматически при необходимости.

После `push` в `main` workflow автоматически:
- деплоит статику в Docker-контейнер nginx;
- деплоит папку `api/` на VPS;
- проверяет/устанавливает Docker/Compose на сервере (если отсутствуют);
- создаёт `.env.runtime` из GitHub Secrets;
- поднимает статику и API через `docker compose`.

