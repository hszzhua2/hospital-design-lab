import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const project = fileURLToPath(new URL('.', import.meta.url));
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'hospital-design-lab';
const base = process.env.PAGES_BASE_PATH ?? `/${repository}/`;

export default defineConfig({
  root: resolve(project, 'static-site'),
  base,
  publicDir: resolve(project, 'public'),
  resolve: { alias: { '@': project } },
  css: { postcss: { plugins: [tailwindcss({ base: project })] } },
  plugins: [
    react(),
    {
      name: 'tracked-public-assets',
      // Optional source drawings may exist locally but are not licensed for
      // public distribution. Only publish public assets tracked by this repo.
      generateBundle() {
        const files = execFileSync('git', ['ls-files', '-z', '--', 'public/'], {
          cwd: project,
          encoding: 'utf8',
        }).split('\0').filter(Boolean);
        for (const file of files) {
          this.emitFile({
            type: 'asset',
            fileName: file.slice('public/'.length),
            source: readFileSync(resolve(project, file)),
          });
        }
        this.emitFile({ type: 'asset', fileName: '.nojekyll', source: '' });
      },
    },
  ],
  build: {
    outDir: resolve(project, 'dist-pages'),
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: {
      input: {
        main: resolve(project, 'static-site/index.html'),
        f1: resolve(project, 'static-site/f1/index.html'),
      },
    },
  },
});
