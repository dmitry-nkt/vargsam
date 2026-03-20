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

