import {defineConfig} from 'astro/config';

// GitHub Pages subpath. Can be overridden in CI with `ASTRO_BASE`.
const base = process.env.ASTRO_BASE ?? '/';

export default defineConfig({
  base,
});

