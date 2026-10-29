# tailwise-website

The landing page, docs and changelog for [Tailwise](https://github.com/tecnosam/tailwise).

Next.js 16 (App Router), Tailwind CSS 4, Motion, three.js through React Three Fiber, Lenis
for smooth scrolling, and Shiki for code.

```sh
npm install
npm run dev          # http://localhost:3000
npm run build
npm run sync-docs    # copy README.md and CHANGELOG.md from ../tailwise
```

| Route | Source |
| --- | --- |
| `/` | `src/app/page.tsx`, sections in `src/components` |
| `/docs` | `src/content/README.md`, rendered at build time |
| `/changelog` | `src/content/CHANGELOG.md` |

Links, the version and the release date live in `src/lib/site.ts`; bump them with each
release. Colours are tokens in `src/app/globals.css` (`--paper` and `--accent`, redefined
under `.dark`).
