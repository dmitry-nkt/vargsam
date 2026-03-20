## scenax-card-site (визитка)

Статика генерируется через **Astro** и деплоится в существующий `gh-pages` как подпапка `vizitka/`.

### Разработка

```bash
cd card-site
npm install
npm run dev
```

### Сборка

```bash
npm run build
```

Собранные файлы лежат в `card-site/dist`.

### Деплой

В корне репозитория уже есть workflow для `docs/`. Для этой визитки будет отдельный workflow, который публикует `card-site/dist` в `vizitka/`.

