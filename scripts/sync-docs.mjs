import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('src/docs');
const outDir = path.resolve('public/docs');

if (!fs.existsSync(srcDir)) {
  console.warn('sync-docs: src/docs not found, skip');
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });

for (const name of fs.readdirSync(srcDir)) {
  if (!name.endsWith('.docx')) continue;
  let slug = name;
  if (name.toLowerCase().includes('cookie')) slug = 'politika-cookie.docx';
  else if (name.includes('конфиденциальности')) slug = 'politika-konfidencialnosti.docx';
  else if (name.includes('Согласие') || name.toLowerCase().includes('согласие')) slug = 'soglasie-pd.docx';
  fs.copyFileSync(path.join(srcDir, name), path.join(outDir, slug));
  console.log('sync-docs:', name, '→', slug);
}
