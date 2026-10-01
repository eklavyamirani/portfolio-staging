## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## This project

- Content lives in `src/data/*.yml`, typed by `src/content.config.ts`. Change content there, not in the page markup.
- Run `npm test` and `npm run check` before committing. CI runs both and won't deploy if either fails.
- Never hard-code `/` in internal links. Use `import.meta.env.BASE_URL`, because the staging site is served from `/portfolio-staging/`.
- The tuner's client script must stay small and only run while the tuner is on screen. Don't add a UI framework for it.
