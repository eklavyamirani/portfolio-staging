// @ts-check
import { defineConfig } from 'astro/config';

// BASE_PATH lets the same build serve from a project sub-path while staging
// (e.g. /portfolio-staging) and from the domain root once promoted.
export default defineConfig({
  site: 'https://github.ekkylab.uk',
  base: process.env.BASE_PATH || '/',
});
