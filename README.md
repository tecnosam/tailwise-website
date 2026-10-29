# tailwise-website

The landing page, docs and changelog for [Tailwise](https://github.com/tecnosam/tailwise).

Next.js 16 (App Router), Tailwind CSS 4, Motion, three.js through React Three Fiber, Lenis
for smooth scrolling, and Shiki for code.

```sh
npm install
npm run dev          # http://localhost:3000
npm run build
```

| Route | Source |
| --- | --- |
| `/` | `src/app/page.tsx`, sections in `src/components` |
| `/docs`, `/docs/architecture` | The engine's README and `architecture/` at the latest release's tag |
| `/changelog` | The engine's CHANGELOG.md at the latest release's tag |
| `/download` | The engine's GitHub releases |

Publishing a release on GitHub updates the site within the hour: downloads, docs, changelog
and every version label. `version` and `released` in `src/lib/site.ts` are only used before
the first release. Links live there too. Colours are tokens in `src/app/globals.css` (`--paper` and `--accent`, redefined
under `.dark`).
