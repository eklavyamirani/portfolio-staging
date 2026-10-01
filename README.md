# portfolio-staging

A staging area for the next version of <https://github.ekkylab.uk>. It is
deployed to <https://github.ekkylab.uk/portfolio-staging/> and is not linked
from anywhere. When it's ready, it moves into `eklavyamirani.github.com`.

Built with [Astro](https://astro.build). Pages are static HTML. The only
client-side JavaScript is the live tuner at the top of the page.

## The live tuner

The tuner runs the YIN pitch detection algorithm (`src/lib/pitch.ts`), the same
technique Fingerboard Coach uses. Until the visitor allows the microphone, it
listens to a synthetic violin (`src/lib/demo-violin.ts`) that plays a G major
scale. Each note lands slightly out of tune, settles, then gets vibrato, so the
detector has real work to do.

- Audio stays in the browser and is never uploaded.
- It pauses when scrolled out of view or when the tab is hidden.
- With reduced motion turned on, it draws a single still frame and does not animate.
- Without JavaScript, a static SVG takes its place.

`npm test` checks the detector against pure tones, harmonic-rich tones, silence
and noise. It also runs 24 seconds of the demo violin through the detector and
requires every frame to be within 3 cents of what the synthetic player intended.

## Editing content

| File | Section |
|------|---------|
| `src/data/projects.yml` | Selected work. The first entry is shown as the large card. |
| `src/data/lab.yml` | Smaller builds. |
| `src/data/music.yml` | Recordings, from a YouTube id or an audio file in `public/media/`. |
| `src/config.ts` | Name, email, location, LinkedIn. |

Entries appear in the same order as in the file. Every entry needs a unique
`id`. The fields are typed in `src/content.config.ts`, so a typo fails the
build instead of quietly shipping.

**Resume:** add `public/resume.pdf` and the resume buttons appear on their own.

## Commands

```sh
npm install
npm run dev      # http://localhost:4321
npm test         # pitch detector tests
npm run check    # type-check .astro and .ts files
npm run build    # static site in dist/
```

## Deploy

Every push to `main` runs the tests and the type check, then builds and
deploys to GitHub Pages (`.github/workflows/deploy.yml`). Pull requests run the
same checks without deploying. The base path comes from Pages, so the same
workflow works unchanged once this moves to the user-site repo, where it serves
from `/`.

## Release and promote

The live site only ever gets a tagged release of this repo.

1. Cut a release when staging looks right:

   ```sh
   gh release create v0.1.0 --generate-notes
   ```

2. Within about 6 hours, the **Promote from staging** workflow in
   `eklavyamirani.github.com` notices the release. It runs the tests and build
   at that tag, then opens a `promote/<tag>` PR there. To skip the wait, run it
   by hand:

   ```sh
   gh workflow run promote.yml -R eklavyamirani/eklavyamirani.github.com           # latest release
   gh workflow run promote.yml -R eklavyamirani/eklavyamirani.github.com -f tag=v0.1.0
   ```

3. Review and merge the PR. Before the first merge, change that repo's
   **Settings → Pages → Source** to **GitHub Actions**. The PR includes this as a checklist item.

No tokens or secrets are involved. This repo is public, so the user-site repo
reads it directly and opens the PR with its own built-in token. Each tag is
proposed only once: a tag that already has a PR (open or closed), or that is
already live according to `.promoted-from`, is skipped.
